import type { Agent, AgentConfig } from '../types/index.js';
import { AgentType } from '../types/index.js';

// Import example agents
import { CompetitorResearchAgent } from './stage1/competitor-research-agent.js';
import { PdfExtractionAgent } from './stage1/pdf-extraction-agent.js';
import { DataNormalizationAgent } from './stage1/data-normalization-agent.js';
import { EntityRecognitionAgent } from './stage1/entity-recognition-agent.js';
import { MarketIntelligenceAgent } from './stage1/market-intelligence-agent.js';
import { MarketOverviewAgent } from './stage1/market-overview-agent.js';
import { MarketDynamicsAgent } from './stage1/market-dynamics-agent.js';
import { PricingIntelligenceAgent } from './stage1/pricing-intelligence-agent.js';
import { ReviewAnalysisAgent } from './stage2/review-analysis-agent.js';
import { SegmentationAgent } from './stage2/segmentation-agent.js';
import { JtbdAgent } from './stage2/jtbd-agent.js';
import { PositioningMapperAgent } from './stage2/positioning-mapper-agent.js';
import { DifferentiationAnalyzerAgent } from './stage2/differentiation-analyzer-agent.js';
import { PositioningStrategyAgent } from './stage3/positioning-strategy-agent.js';
import { MessagingArchitectureAgent } from './stage3/messaging-architecture-agent.js';
import { BrandNarrativeAgent } from './stage3/brand-narrative-agent.js';
import { RoadmapPlanningAgent } from './stage3/roadmap-planning-agent.js';
import { StrategicDocumentWriterAgent } from './stage4/strategic-document-writer-agent.js';
import { ExecutiveSummaryWriterAgent } from './stage4/executive-summary-writer-agent.js';
import { ConsistencyCheckerAgent } from './stage5/consistency-checker-agent.js';
import { HtmlGeneratorAgent } from './stage6/html-generator-agent.js';
import { FinancialProjectionAgent } from './stage2/financial-projection-agent.js';

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

      case AgentType.ENTITY_RECOGNITION:
        return new EntityRecognitionAgent(config, this.apiKey);

      case AgentType.MARKET_INTELLIGENCE:
        return new MarketIntelligenceAgent(config, this.apiKey);

      case AgentType.MARKET_OVERVIEW:
        return new MarketOverviewAgent(config, this.apiKey);

      case AgentType.MARKET_DYNAMICS:
        return new MarketDynamicsAgent(config, this.apiKey);

      case AgentType.PRICING_INTELLIGENCE:
        return new PricingIntelligenceAgent(config, this.apiKey);

      // Stage 2: Analysis
      case AgentType.REVIEW_ANALYSIS:
        return new ReviewAnalysisAgent(config, this.apiKey);

      case AgentType.SEGMENTATION:
        return new SegmentationAgent(config, this.apiKey);

      case AgentType.JOBS_TO_BE_DONE:
        return new JtbdAgent(config, this.apiKey);

      case AgentType.POSITIONING_MAPPER:
        return new PositioningMapperAgent(config, this.apiKey);

      case AgentType.DIFFERENTIATION_ANALYZER:
        return new DifferentiationAnalyzerAgent(config, this.apiKey);

      case AgentType.FINANCIAL_PROJECTION:
        return new FinancialProjectionAgent(config, this.apiKey);

      // Stage 3: Strategic Intelligence
      case AgentType.POSITIONING_STRATEGY:
        return new PositioningStrategyAgent(config, this.apiKey);

      case AgentType.MESSAGING_ARCHITECTURE:
        return new MessagingArchitectureAgent(config, this.apiKey);

      case AgentType.BRAND_NARRATIVE:
        return new BrandNarrativeAgent(config, this.apiKey);

      case AgentType.ROADMAP_PLANNING:
        return new RoadmapPlanningAgent(config, this.apiKey);

      // Stage 4: Content Generation
      case AgentType.STRATEGIC_DOCUMENT_WRITER:
        return new StrategicDocumentWriterAgent(config, this.apiKey);

      case AgentType.EXECUTIVE_SUMMARY_WRITER:
        return new ExecutiveSummaryWriterAgent(config, this.apiKey);

      // Stage 5: Quality Assurance
      case AgentType.CONSISTENCY_CHECKER:
        return new ConsistencyCheckerAgent(config, this.apiKey);

      // Stage 6: Production
      case AgentType.HTML_GENERATOR:
        return new HtmlGeneratorAgent(config, this.apiKey);

      // For agents not yet implemented, throw an error
      // This prevents silent failures where stages appear to succeed
      // but are built on meaningless placeholder data
      default:
        throw new Error(
          `Agent type '${type}' is not yet implemented. ` +
          'This agent has been removed from stage schedules to prevent ' +
          'hallucinated/placeholder data from propagating through the pipeline. ' +
          'If you need this agent, implement it first before adding to the schedule.'
        );
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
