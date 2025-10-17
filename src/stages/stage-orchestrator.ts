import type { AgentOutput, BrandContext } from '../types/index.js';
import { Stage, AgentType } from '../types/index.js';
import { AgentFactory } from '../agents/agent-factory.js';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Stage Orchestrator - Executes agents within each stage
 */
export class StageOrchestrator {
  private agentFactory: AgentFactory;
  private maxParallel: number;

  constructor(apiKey: string, maxParallel: number = 5) {
    this.agentFactory = new AgentFactory(apiKey);
    this.maxParallel = maxParallel;
  }

  /**
   * Execute all agents for a given stage
   */
  async executeStage(
    stage: Stage,
    brandContext: BrandContext,
    previousOutputs: Record<string, unknown>
  ): Promise<AgentOutput[]> {
    const agentTypes = this.getAgentsForStage(stage);

    console.log(chalk.gray(`  Agents: ${agentTypes.length}`));

    const outputs: AgentOutput[] = [];

    // Execute agents in batches for parallel processing
    for (let i = 0; i < agentTypes.length; i += this.maxParallel) {
      const batch = agentTypes.slice(i, i + this.maxParallel);

      const batchOutputs = await Promise.all(
        batch.map(async agentType => {
          const spinner = ora(`  ${this.getAgentName(agentType)}`).start();

          try {
            const agent = this.agentFactory.createAgent(agentType);
            const output = await agent.execute({
              context: brandContext,
              previousStageOutputs: previousOutputs
            });

            if (output.status === 'completed') {
              spinner.succeed(chalk.green(`${this.getAgentName(agentType)}`));
            } else {
              spinner.fail(chalk.red(`${this.getAgentName(agentType)} - ${output.errors?.[0] || 'Failed'}`));
            }

            return output;
          } catch (error) {
            spinner.fail(chalk.red(`${this.getAgentName(agentType)} - ${(error as Error).message}`));
            throw error;
          }
        })
      );

      outputs.push(...batchOutputs);
    }

    return outputs;
  }

  /**
   * Get agents required for each stage
   *
   * IMPORTANT: Only includes IMPLEMENTED agents. Unimplemented agents
   * have been removed to prevent PlaceholderAgent from silently returning
   * mock data that appears successful but is meaningless.
   *
   * Removed (not yet implemented):
   * - Stage 1: VISUAL_IDENTITY_AUDITOR, UX_AUDITOR
   * - Stage 2: ROI_CALCULATOR, BUDGET_ALLOCATION
   * - Stage 3: RESOURCE_PLANNING, RISK_IDENTIFICATION, MITIGATION_STRATEGY
   * - Stage 4: TECHNICAL_SPEC_WRITER, NARRATIVE_FLOW, NAVIGATION_BUILDER
   * - Stage 5: FACT_VERIFICATION, CONTRADICTION_DETECTOR, STRATEGIC_AUDITOR, GAP_ANALYZER
   * - Stage 6: ASSET_OPTIMIZER, PDF_GENERATOR
   */
  private getAgentsForStage(stage: Stage): AgentType[] {
    const stageAgents: Record<Stage, AgentType[]> = {
      [Stage.DATA_INGESTION]: [
        AgentType.PDF_EXTRACTION,
        AgentType.DATA_NORMALIZATION,
        AgentType.ENTITY_RECOGNITION,
        AgentType.COMPETITOR_RESEARCH,
        AgentType.MARKET_INTELLIGENCE,
        AgentType.PRICING_INTELLIGENCE,
        AgentType.MARKET_OVERVIEW,
        AgentType.MARKET_DYNAMICS
      ],
      [Stage.ANALYSIS]: [
        AgentType.REVIEW_ANALYSIS,
        AgentType.SEGMENTATION,
        AgentType.JOBS_TO_BE_DONE,
        AgentType.POSITIONING_MAPPER,
        AgentType.DIFFERENTIATION_ANALYZER,
        AgentType.FINANCIAL_PROJECTION
      ],
      [Stage.INTELLIGENCE]: [
        AgentType.POSITIONING_STRATEGY,
        AgentType.MESSAGING_ARCHITECTURE,
        AgentType.BRAND_NARRATIVE,
        AgentType.ROADMAP_PLANNING
      ],
      [Stage.STRATEGY]: [
        AgentType.STRATEGIC_DOCUMENT_WRITER,
        AgentType.EXECUTIVE_SUMMARY_WRITER
      ],
      [Stage.VALIDATION]: [
        AgentType.CONSISTENCY_CHECKER
      ],
      [Stage.PRODUCTION]: [
        AgentType.HTML_GENERATOR
      ]
    };

    return stageAgents[stage] || [];
  }

  /**
   * Get human-readable agent name
   */
  private getAgentName(agentType: AgentType): string {
    return agentType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
