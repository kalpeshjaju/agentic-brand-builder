import { z } from 'zod';

// ============================================================================
// STAGE TYPES
// ============================================================================

export enum Stage {
  DATA_INGESTION = 'data_ingestion',
  ANALYSIS = 'analysis',
  INTELLIGENCE = 'intelligence',
  STRATEGY = 'strategy',
  VALIDATION = 'validation',
  PRODUCTION = 'production'
}

export enum StageStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

// ============================================================================
// AGENT TYPES
// ============================================================================

export enum AgentType {
  // Stage 1: Data Ingestion
  PDF_EXTRACTION = 'pdf_extraction',
  DATA_NORMALIZATION = 'data_normalization',
  ENTITY_RECOGNITION = 'entity_recognition',
  COMPETITOR_RESEARCH = 'competitor_research',
  // Market Intelligence split into smaller agents
  MARKET_INTELLIGENCE = 'market_intelligence',  // Legacy - to be removed
  MARKET_OVERVIEW = 'market_overview',
  MARKET_TRENDS = 'market_trends',
  MARKET_DYNAMICS = 'market_dynamics',
  // Pricing Intelligence split into smaller agents
  PRICING_INTELLIGENCE = 'pricing_intelligence',  // Legacy - to be removed
  COMPETITIVE_PRICING = 'competitive_pricing',
  PRICING_STRATEGY = 'pricing_strategy',
  VISUAL_IDENTITY_AUDITOR = 'visual_identity_auditor',
  PACKAGING_DESIGN_AUDITOR = 'packaging_design_auditor',
  UX_AUDITOR = 'ux_auditor',

  // Stage 2: Analysis
  REVIEW_ANALYSIS = 'review_analysis',
  SEGMENTATION = 'segmentation',
  JOBS_TO_BE_DONE = 'jobs_to_be_done',
  POSITIONING_MAPPER = 'positioning_mapper',
  DIFFERENTIATION_ANALYZER = 'differentiation_analyzer',
  FINANCIAL_PROJECTION = 'financial_projection',
  ROI_CALCULATOR = 'roi_calculator',
  BUDGET_ALLOCATION = 'budget_allocation',

  // Stage 3: Strategic Intelligence
  POSITIONING_STRATEGY = 'positioning_strategy',
  MESSAGING_ARCHITECTURE = 'messaging_architecture',
  BRAND_NARRATIVE = 'brand_narrative',
  ROADMAP_PLANNING = 'roadmap_planning',
  RESOURCE_PLANNING = 'resource_planning',
  TIMELINE_OPTIMIZATION = 'timeline_optimization',
  RISK_IDENTIFICATION = 'risk_identification',
  MITIGATION_STRATEGY = 'mitigation_strategy',

  // Stage 4: Content Generation
  STRATEGIC_DOCUMENT_WRITER = 'strategic_document_writer',
  EXECUTIVE_SUMMARY_WRITER = 'executive_summary_writer',
  TECHNICAL_SPEC_WRITER = 'technical_spec_writer',
  NARRATIVE_FLOW = 'narrative_flow',
  NAVIGATION_BUILDER = 'navigation_builder',

  // Stage 5: Quality Assurance
  CONSISTENCY_CHECKER = 'consistency_checker',
  FACT_VERIFICATION = 'fact_verification',
  CONTRADICTION_DETECTOR = 'contradiction_detector',
  STRATEGIC_AUDITOR = 'strategic_auditor',
  GAP_ANALYZER = 'gap_analyzer',
  UX_SYNTHESIS = 'ux_synthesis',

  // Stage 6: Production
  HTML_GENERATOR = 'html_generator',
  ASSET_OPTIMIZER = 'asset_optimizer',
  PDF_GENERATOR = 'pdf_generator',
  PRESENTATION_BUILDER = 'presentation_builder'
}

export enum AgentStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  WAITING = 'waiting'
}

// ============================================================================
// BRAND CONTEXT
// ============================================================================

export const BrandContextSchema = z.object({
  brandName: z.string(),
  category: z.string(),
  currentRevenue: z.string().optional(),
  targetRevenue: z.string().optional(),
  website: z.string().url().optional(),
  competitors: z.array(z.string()).default([]),
  dataSources: z.array(z.object({
    type: z.enum(['pdf', 'website', 'reviews', 'social_media', 'financial_docs']),
    path: z.string(),
    description: z.string().optional()
  })).default([]),
  customInstructions: z.string().optional()
});

export type BrandContext = z.infer<typeof BrandContextSchema>;

// ============================================================================
// AGENT INTERFACES
// ============================================================================

export interface AgentConfig {
  type: AgentType;
  maxRetries: number;
  timeout: number;
  model: string;
  temperature: number;
}

export interface AgentInput {
  context: BrandContext;
  previousStageOutputs?: Record<string, unknown>;
  specificInstructions?: string;
}

export interface AgentOutput {
  agentType: AgentType;
  status: AgentStatus;
  data: unknown;
  metadata: {
    tokensUsed: number;
    durationMs: number;
    confidence?: number;
    sources?: string[];
  };
  errors?: string[];
}

export interface Agent {
  config: AgentConfig;
  execute(input: AgentInput): Promise<AgentOutput>;
}

// ============================================================================
// STAGE RESULTS
// ============================================================================

export interface StageResult {
  stage: Stage;
  status: StageStatus;
  agentOutputs: AgentOutput[];
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  errors?: string[];
}

// ============================================================================
// ORCHESTRATION
// ============================================================================

export interface OrchestrationConfig {
  brandContext: BrandContext;
  stages: Stage[];
  parallelAgents: number;
  outputFormats: ('html' | 'pdf' | 'markdown')[];
  outputDir: string;
}

export interface OrchestrationResult {
  brandContext: BrandContext;
  stageResults: StageResult[];
  overallStatus: 'success' | 'partial' | 'failed';
  startedAt: Date;
  completedAt: Date;
  totalDurationMs: number;
  outputs: {
    format: string;
    path: string;
  }[];
}

// ============================================================================
// QUALITY GATES
// ============================================================================

export interface QualityGate {
  stage: Stage;
  criteria: QualityCriterion[];
  passed: boolean;
  score?: number;
}

export interface QualityCriterion {
  name: string;
  description: string;
  required: boolean;
  check: (stageResult: StageResult) => Promise<boolean>;
  score?: number;
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export interface Document {
  id: string;
  title: string;
  act: number;
  content: string;
  metadata: {
    wordCount: number;
    readingTimeMinutes: number;
    completeness: number;
    sources: string[];
  };
}

export interface Act {
  number: number;
  title: string;
  description: string;
  documents: Document[];
  readingTimeMinutes: number;
  completeness: number;
}
