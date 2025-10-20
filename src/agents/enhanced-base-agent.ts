/**
 * Enhanced Base Agent with Multi-LLM Support
 * Uses Claude for architecture, OpenAI for generation, Gemini for visual
 */

import { llmClient, TaskType } from '../utils/shared-llm-utils/llm-client';

export abstract class EnhancedBaseAgent {
  protected name: string;
  protected confidence: number = 0;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Process with automatic model selection
   */
  protected async processWithBestModel(
    prompt: string,
    taskType: TaskType
  ) {
    console.log(`🤖 ${this.name}: Processing ${taskType} task`);

    const response = await llmClient.process(prompt, taskType);

    this.confidence = response.confidence;
    console.log(`✅ Completed with ${response.model} (confidence: ${response.confidence})`);

    return response.content;
  }

  /**
   * Use Claude specifically for deep analysis
   */
  protected async analyzeWithClaude(content: string) {
    return this.processWithBestModel(
      `Analyze the following for brand extraction:\n${content}`,
      'architecture'
    );
  }

  /**
   * Use OpenAI for content generation
   */
  protected async generateWithOpenAI(prompt: string) {
    return this.processWithBestModel(prompt, 'code_generation');
  }

  /**
   * Use Gemini for visual analysis
   */
  protected async analyzeVisualWithGemini(_imageBuffer: Buffer) {
    // Gemini visual analysis would go here
    // TODO: Implement image upload and analysis with Gemini API
    return this.processWithBestModel(
      'Analyze this brand visual',
      'visual_analysis'
    );
  }

  abstract execute(input: any): Promise<any>;
}
