/**
 * Unified LLM Client for Multi-Model Orchestration
 * Handles Claude, OpenAI, and Gemini APIs with automatic routing
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config({ path: '../.env.global' });

// Response schema to ensure consistency
const LLMResponseSchema = z.object({
  content: z.string(),
  model: z.string(),
  confidence: z.number().min(0).max(1),
  tokens_used: z.number(),
  cost_estimate: z.number(),
  processing_time_ms: z.number()
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

export type TaskType =
  | 'code_generation'
  | 'code_review'
  | 'architecture'
  | 'debugging'
  | 'testing'
  | 'documentation'
  | 'research'
  | 'visual_analysis';

/**
 * Unified LLM Client
 */
export class UnifiedLLMClient {
  private claude: Anthropic;
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;

  constructor() {
    // Initialize Claude
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    });

    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });

    // Initialize Gemini
    this.gemini = new GoogleGenerativeAI(
      process.env.GOOGLE_API_KEY || ''
    );
  }

  /**
   * Route task to appropriate model based on type
   */
  private selectModel(taskType: TaskType): 'claude' | 'openai' | 'gemini' {
    const routing: Record<TaskType, 'claude' | 'openai' | 'gemini'> = {
      'code_generation': 'openai',     // Codex is best for generation
      'code_review': 'claude',          // Claude best for review
      'architecture': 'claude',         // Claude for deep thinking
      'debugging': 'openai',            // Codex understands errors
      'testing': 'claude',              // Claude for test design
      'documentation': 'claude',        // Claude for clear writing
      'research': 'openai',             // GPT-4 for broad knowledge
      'visual_analysis': 'gemini'       // Gemini for images
    };

    return routing[taskType] || 'claude';
  }

  /**
   * Process request with appropriate model
   */
  async process(
    prompt: string,
    taskType: TaskType,
    options: {
      maxTokens?: number;
      temperature?: number;
      images?: Buffer[];
    } = {}
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = this.selectModel(taskType);

    console.log(`🤖 Routing ${taskType} to ${model}`);

    let response: LLMResponse;

    switch (model) {
      case 'claude':
        response = await this.processWithClaude(prompt, options);
        break;

      case 'openai':
        response = await this.processWithOpenAI(prompt, options);
        break;

      case 'gemini':
        response = await this.processWithGemini(prompt, options);
        break;

      default:
        throw new Error(`Unknown model: ${model}`);
    }

    response.processing_time_ms = Date.now() - startTime;
    return response;
  }

  /**
   * Process with Claude
   */
  private async processWithClaude(
    prompt: string,
    options: any
  ): Promise<LLMResponse> {
    try {
      const message = await this.claude.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.3
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return {
        content: content.text,
        model: 'claude',
        confidence: 0.9, // Claude is generally high confidence
        tokens_used: message.usage?.output_tokens || 0,
        cost_estimate: (message.usage?.output_tokens || 0) * 0.00003,
        processing_time_ms: 0 // Will be set by caller
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  /**
   * Process with OpenAI
   */
  private async processWithOpenAI(
    prompt: string,
    options: any
  ): Promise<LLMResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.3
      });

      const response = completion.choices[0];
      if (!response?.message?.content) {
        throw new Error('No response from OpenAI');
      }

      return {
        content: response.message.content,
        model: 'openai',
        confidence: 0.85,
        tokens_used: completion.usage?.total_tokens || 0,
        cost_estimate: (completion.usage?.total_tokens || 0) * 0.00002,
        processing_time_ms: 0
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  /**
   * Process with Gemini
   */
  private async processWithGemini(
    prompt: string,
    _options: any
  ): Promise<LLMResponse> {
    try {
      const model = this.gemini.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-pro'
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return {
        content: text,
        model: 'gemini',
        confidence: 0.87,
        tokens_used: 1000, // Gemini doesn't provide exact tokens
        cost_estimate: 0.01, // Estimate
        processing_time_ms: 0
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  /**
   * Test all API connections
   */
  async testConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    // Test Claude
    try {
      await this.processWithClaude('Say "API working"', {});
      results.claude = true;
      console.log('✅ Claude API working');
    } catch {
      results.claude = false;
      console.log('❌ Claude API failed');
    }

    // Test OpenAI
    try {
      await this.processWithOpenAI('Say "API working"', {});
      results.openai = true;
      console.log('✅ OpenAI API working');
    } catch {
      results.openai = false;
      console.log('❌ OpenAI API failed');
    }

    // Test Gemini
    try {
      await this.processWithGemini('Say "API working"', {});
      results.gemini = true;
      console.log('✅ Gemini API working');
    } catch {
      results.gemini = false;
      console.log('❌ Gemini API failed');
    }

    return results;
  }
}

// Export singleton instance
export const llmClient = new UnifiedLLMClient();