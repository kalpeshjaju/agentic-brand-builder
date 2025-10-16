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
        AgentType.VISUAL_IDENTITY_AUDITOR,
        AgentType.UX_AUDITOR
      ],
      [Stage.ANALYSIS]: [
        AgentType.REVIEW_ANALYSIS,
        AgentType.SEGMENTATION,
        AgentType.JOBS_TO_BE_DONE,
        AgentType.POSITIONING_MAPPER,
        AgentType.DIFFERENTIATION_ANALYZER,
        AgentType.FINANCIAL_PROJECTION,
        AgentType.ROI_CALCULATOR,
        AgentType.BUDGET_ALLOCATION
      ],
      [Stage.INTELLIGENCE]: [
        AgentType.POSITIONING_STRATEGY,
        AgentType.MESSAGING_ARCHITECTURE,
        AgentType.BRAND_NARRATIVE,
        AgentType.ROADMAP_PLANNING,
        AgentType.RESOURCE_PLANNING,
        AgentType.RISK_IDENTIFICATION,
        AgentType.MITIGATION_STRATEGY
      ],
      [Stage.STRATEGY]: [
        AgentType.STRATEGIC_DOCUMENT_WRITER,
        AgentType.EXECUTIVE_SUMMARY_WRITER,
        AgentType.TECHNICAL_SPEC_WRITER,
        AgentType.NARRATIVE_FLOW,
        AgentType.NAVIGATION_BUILDER
      ],
      [Stage.VALIDATION]: [
        AgentType.CONSISTENCY_CHECKER,
        AgentType.FACT_VERIFICATION,
        AgentType.CONTRADICTION_DETECTOR,
        AgentType.STRATEGIC_AUDITOR,
        AgentType.GAP_ANALYZER
      ],
      [Stage.PRODUCTION]: [
        AgentType.HTML_GENERATOR,
        AgentType.ASSET_OPTIMIZER,
        AgentType.PDF_GENERATOR
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
