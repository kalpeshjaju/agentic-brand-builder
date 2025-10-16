import Anthropic from '@anthropic-ai/sdk';
import type { Agent, AgentConfig, AgentInput, AgentOutput, AgentStatus } from '../types/index.js';

export abstract class BaseAgent implements Agent {
  protected client: Anthropic;
  public config: AgentConfig;

  constructor(config: AgentConfig, apiKey: string) {
    this.config = config;
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Execute the agent with retry logic
   */
  async execute(input: AgentInput): Promise<AgentOutput> {
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
    return Promise.race([
      this.run(input),
      this.timeout()
    ]);
  }

  /**
   * Timeout promise
   */
  private timeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent ${this.config.type} timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
   */
  protected formatPreviousOutputs(input: AgentInput): string {
    if (!input.previousStageOutputs || Object.keys(input.previousStageOutputs).length === 0) {
      return '';
    }

    return `
# Previous Stage Outputs

${Object.entries(input.previousStageOutputs)
  .map(([key, value]) => `## ${key}\n\n${JSON.stringify(value, null, 2)}`)
  .join('\n\n')}
    `.trim();
  }
}
