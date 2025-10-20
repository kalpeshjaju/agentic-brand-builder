import Anthropic from '@anthropic-ai/sdk';
import type { Agent, AgentConfig, AgentInput, AgentOutput, AgentStatus } from '../types/index.js';
import { claudeRateLimiter } from '../utils/rate-limiter.js';

export abstract class BaseAgent implements Agent {
  protected client: Anthropic;
  public config: AgentConfig;
  private activeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: AgentConfig, apiKey: string) {
    this.config = config;
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Execute the agent with retry logic
   */
  async execute(input: AgentInput): Promise<AgentOutput> {
    // Validate input before execution
    this.validateInput(input);

    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.executeWithTimeout(input);
        const durationMs = Date.now() - startTime;

        return {
          agentType: this.config.type,
          status: 'completed' as AgentStatus,
          data: result.data,
          metadata: {
            tokensUsed: result.tokensUsed || 0,
            durationMs,
            confidence: result.confidence,
            sources: result.sources
          }
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.maxRetries) {
          // Exponential backoff
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed
    const durationMs = Date.now() - startTime;
    return {
      agentType: this.config.type,
      status: 'failed' as AgentStatus,
      data: null,
      metadata: {
        tokensUsed: 0,
        durationMs
      },
      errors: [lastError?.message || 'Unknown error']
    };
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    try {
      const result = await Promise.race([
        this.run(input),
        this.timeout()
      ]);
      // Clear timer if run() completes first
      this.clearTimer();
      return result;
    } catch (error) {
      // Clear timer on error
      this.clearTimer();
      throw error;
    }
  }

  /**
   * Timeout promise
   */
  private timeout(): Promise<never> {
    return new Promise((_, reject) => {
      this.activeTimer = setTimeout(() => {
        reject(new Error(`Agent ${this.config.type} timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });
  }

  /**
   * Clear active timer to prevent memory leak
   */
  private clearTimer(): void {
    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate agent input
   * Throws error if required fields are missing
   */
  protected validateInput(input: AgentInput): void {
    if (!input) {
      throw new Error('Agent input is required');
    }
    if (!input.context) {
      throw new Error('Brand context is required');
    }
    if (!input.context.brandName) {
      throw new Error('Brand name is required in context');
    }
    if (!input.context.category) {
      throw new Error('Brand category is required in context');
    }
  }

  /**
   * Abstract method to be implemented by specific agents
   */
  protected abstract run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }>;

  /**
   * Helper method to call Claude API
   * Includes automatic rate limiting to prevent hitting API limits
   */
  protected async callClaude(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<{
    content: string;
    tokensUsed: number;
  }> {
    // Wait for rate limiter slot before making request
    // This prevents parallel agents from overwhelming the API
    await claudeRateLimiter.waitForSlot();

    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: options?.maxTokens || 8000,
      temperature: options?.temperature || this.config.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    return {
      content: content.text,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens
    };
  }

  /**
   * Format brand context for prompts
   */
  protected formatBrandContext(input: AgentInput): string {
    const { context } = input;
    return `
# Brand Context

**Brand Name**: ${context.brandName}
**Category**: ${context.category}
${context.currentRevenue ? `**Current Revenue**: ${context.currentRevenue}` : ''}
${context.targetRevenue ? `**Target Revenue**: ${context.targetRevenue}` : ''}
${context.website ? `**Website**: ${context.website}` : ''}
${context.competitors.length > 0 ? `**Competitors**: ${context.competitors.join(', ')}` : ''}

${context.customInstructions ? `\n**Custom Instructions**:\n${context.customInstructions}` : ''}
    `.trim();
  }

  /**
   * Format previous stage outputs for context
   * IMPORTANT: Limits output size to prevent unbounded prompt growth
   * as stages accumulate. Without this, prompt size grows exponentially.
   */
  protected formatPreviousOutputs(input: AgentInput): string {
    if (!input.previousStageOutputs || Object.keys(input.previousStageOutputs).length === 0) {
      return '';
    }

    // Budget: max 5000 chars per stage output, max 20000 chars total
    const MAX_CHARS_PER_STAGE = 5000;
    const MAX_TOTAL_CHARS = 20000;

    let totalChars = 0;
    const formattedOutputs: string[] = [];

    for (const [key, value] of Object.entries(input.previousStageOutputs)) {
      if (totalChars >= MAX_TOTAL_CHARS) {
        formattedOutputs.push('\n## [Additional stages truncated to stay within prompt budget]');
        break;
      }

      const jsonString = JSON.stringify(value, null, 2);

      if (jsonString.length <= MAX_CHARS_PER_STAGE) {
        // Fits within budget, include full output
        formattedOutputs.push(`## ${key}\n\n${jsonString}`);
        totalChars += jsonString.length;
      } else {
        // Too large, truncate with warning
        const truncated = jsonString.substring(0, MAX_CHARS_PER_STAGE);
        const truncationMsg = `[Truncated: ${jsonString.length} chars → ` +
          `${MAX_CHARS_PER_STAGE} chars to prevent prompt overflow]`;
        formattedOutputs.push(`## ${key}\n\n${truncated}\n\n${truncationMsg}`);
        totalChars += MAX_CHARS_PER_STAGE;
      }
    }

    return `
# Previous Stage Outputs

${formattedOutputs.join('\n\n')}
    `.trim();
  }
}
