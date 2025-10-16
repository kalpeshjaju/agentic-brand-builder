import type { Agent, AgentConfig } from '../types/index.js';
import { AgentType } from '../types/index.js';
import { BaseAgent } from './base-agent.js';

// Import example agents
import { CompetitorResearchAgent } from './stage1/competitor-research-agent.js';
import { PdfExtractionAgent } from './stage1/pdf-extraction-agent.js';
import { DataNormalizationAgent } from './stage1/data-normalization-agent.js';
import { ReviewAnalysisAgent } from './stage2/review-analysis-agent.js';
import { SegmentationAgent } from './stage2/segmentation-agent.js';
import { JtbdAgent } from './stage2/jtbd-agent.js';
import { PositioningStrategyAgent } from './stage3/positioning-strategy-agent.js';
import { MessagingArchitectureAgent } from './stage3/messaging-architecture-agent.js';
import { StrategicDocumentWriterAgent } from './stage4/strategic-document-writer-agent.js';
import { HtmlGeneratorAgent } from './stage6/html-generator-agent.js';

/**
 * Agent Factory - Creates agents based on type
 */
export class AgentFactory {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'claude-sonnet-4-5-20250929') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  /**
   * Create an agent by type
   */
  createAgent(type: AgentType): Agent {
    const config = this.getDefaultConfig(type);

    // Map agent types to implementations
    switch (type) {
      // Stage 1: Data Ingestion
      case AgentType.COMPETITOR_RESEARCH:
        return new CompetitorResearchAgent(config, this.apiKey);

      case AgentType.PDF_EXTRACTION:
        return new PdfExtractionAgent(config, this.apiKey);

      case AgentType.DATA_NORMALIZATION:
        return new DataNormalizationAgent(config, this.apiKey);

      // Stage 2: Analysis
      case AgentType.REVIEW_ANALYSIS:
        return new ReviewAnalysisAgent(config, this.apiKey);

      case AgentType.SEGMENTATION:
        return new SegmentationAgent(config, this.apiKey);

      case AgentType.JOBS_TO_BE_DONE:
        return new JtbdAgent(config, this.apiKey);

      // Stage 3: Strategic Intelligence
      case AgentType.POSITIONING_STRATEGY:
        return new PositioningStrategyAgent(config, this.apiKey);

      case AgentType.MESSAGING_ARCHITECTURE:
        return new MessagingArchitectureAgent(config, this.apiKey);

      // Stage 4: Content Generation
      case AgentType.STRATEGIC_DOCUMENT_WRITER:
        return new StrategicDocumentWriterAgent(config, this.apiKey);

      // Stage 6: Production
      case AgentType.HTML_GENERATOR:
        return new HtmlGeneratorAgent(config, this.apiKey);

      // For agents not yet implemented, use a placeholder
      default:
        return new PlaceholderAgent(config, this.apiKey, type);
    }
  }

  /**
   * Get default configuration for an agent type
   */
  private getDefaultConfig(type: AgentType): AgentConfig {
    return {
      type,
      maxRetries: 2,
      timeout: 300000, // 5 minutes
      model: this.defaultModel,
      temperature: 0.3 // Lower temperature for more consistent outputs
    };
  }
}

/**
 * Placeholder agent for agents not yet implemented
 * Returns mock data to allow system testing
 */
class PlaceholderAgent extends BaseAgent {
  private agentType: AgentType;

  constructor(config: AgentConfig, apiKey: string, agentType: AgentType) {
    super(config, apiKey);
    this.agentType = agentType;
  }

  protected async run(input: import('../types/index.js').AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      data: {
        placeholder: true,
        agentType: this.agentType,
        message: `Agent ${this.agentType} not yet implemented - placeholder data`,
        brandName: input.context.brandName
      },
      tokensUsed: 100,
      confidence: 0.5,
      sources: ['placeholder']
    };
  }
}
