/**
 * Agentic Brand Builder
 *
 * Main entry point for programmatic usage
 */

export { MasterOrchestrator } from './orchestrator/master-orchestrator.js';
export { StageOrchestrator } from './stages/stage-orchestrator.js';
export { ContextManager } from './config/context-manager.js';
export { BaseAgent } from './agents/base-agent.js';
export { AgentFactory } from './agents/agent-factory.js';

export type {
  BrandContext,
  OrchestrationConfig,
  OrchestrationResult,
  StageResult,
  Agent,
  AgentConfig,
  AgentInput,
  AgentOutput,
  Document,
  Act
} from './types/index.js';

export { Stage, AgentType, AgentStatus, StageStatus } from './types/index.js';
