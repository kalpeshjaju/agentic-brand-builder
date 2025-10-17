import type {
  OrchestrationConfig,
  OrchestrationResult,
  StageResult,
  QualityGate
} from '../types/index.js';
import { Stage, StageStatus, AgentStatus } from '../types/index.js';
import { StageOrchestrator } from '../stages/stage-orchestrator.js';
import { ContextManager } from '../config/context-manager.js';
import chalk from 'chalk';

/**
 * Master Orchestrator - Coordinates all 6 stages of brand intelligence generation
 */
export class MasterOrchestrator {
  private config: OrchestrationConfig;
  private contextManager: ContextManager;
  private stageOrchestrator: StageOrchestrator;

  constructor(config: OrchestrationConfig, apiKey: string) {
    this.config = config;
    this.contextManager = new ContextManager(config.brandContext);
    this.stageOrchestrator = new StageOrchestrator(apiKey, config.parallelAgents);
  }

  /**
   * Run the complete orchestration pipeline
   */
  async orchestrate(): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const stageResults: StageResult[] = [];

    console.log(chalk.bold.blue('\n🚀 Agentic Brand Builder - Starting Orchestration\n'));
    console.log(chalk.gray(`Brand: ${this.config.brandContext.brandName}`));
    console.log(chalk.gray(`Category: ${this.config.brandContext.category}`));
    console.log(chalk.gray(`Stages: ${this.config.stages.length}\n`));

    try {
      for (const stage of this.config.stages) {
        console.log(chalk.bold.cyan(`\n📍 Stage ${this.getStageNumber(stage)}: ${this.getStageName(stage)}`));

        const stageResult = await this.executeStage(stage, stageResults);
        stageResults.push(stageResult);

        // Check quality gate
        const qualityGate = await this.checkQualityGate(stage, stageResult);

        if (!qualityGate.passed) {
          console.log(chalk.bold.red(`\n❌ Quality gate failed for ${this.getStageName(stage)}`));
          console.log(chalk.red(`Score: ${qualityGate.score}/10`));

          // Decide whether to continue or abort
          if (this.isCriticalStage(stage)) {
            throw new Error(`Critical stage ${stage} failed quality gate`);
          } else {
            console.log(chalk.yellow('⚠️  Continuing with warnings...'));
          }
        } else {
          console.log(chalk.green(`✅ Quality gate passed (${qualityGate.score}/10)`));
        }

        // Update shared context
        this.contextManager.updateStageOutput(stage, stageResult);
      }

      const totalDurationMs = Date.now() - startTime;
      const overallStatus = this.determineOverallStatus(stageResults);

      console.log(chalk.bold.green(`\n✅ Orchestration completed in ${(totalDurationMs / 1000).toFixed(2)}s`));

      return {
        brandContext: this.config.brandContext,
        stageResults,
        overallStatus,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        totalDurationMs,
        outputs: [] // Will be populated by production stage
      };
    } catch (error) {
      const totalDurationMs = Date.now() - startTime;

      console.log(chalk.bold.red(`\n❌ Orchestration failed: ${(error as Error).message}`));

      return {
        brandContext: this.config.brandContext,
        stageResults,
        overallStatus: 'failed',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        totalDurationMs,
        outputs: []
      };
    }
  }

  /**
   * Execute a single stage
   */
  private async executeStage(stage: Stage, _previousResults: StageResult[]): Promise<StageResult> {
    const startTime = Date.now();

    try {
      const previousOutputs = this.contextManager.getAllStageOutputs();
      const agentOutputs = await this.stageOrchestrator.executeStage(
        stage,
        this.config.brandContext,
        previousOutputs
      );

      const durationMs = Date.now() - startTime;

      // Check if any agents failed within this stage
      const hasFailedAgents = agentOutputs.some(output => output.status === AgentStatus.FAILED);
      const stageStatus = hasFailedAgents ? StageStatus.FAILED : StageStatus.COMPLETED;

      return {
        stage,
        status: stageStatus,
        agentOutputs,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        durationMs
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;

      return {
        stage,
        status: 'failed' as StageStatus,
        agentOutputs: [],
        startedAt: new Date(startTime),
        completedAt: new Date(),
        durationMs,
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Check quality gate for a stage
   */
  private async checkQualityGate(stage: Stage, result: StageResult): Promise<QualityGate> {
    // Quality criteria will be defined per stage
    const criteria = this.getQualityCriteria(stage);

    const checks = await Promise.all(
      criteria.map(async criterion => {
        const passed = await criterion.check(result);
        return { criterion, passed };
      })
    );

    const requiredPassed = checks
      .filter(c => c.criterion.required)
      .every(c => c.passed);

    const totalScore = checks.reduce((sum, c) => sum + (c.passed ? (c.criterion.score || 1) : 0), 0);
    const maxScore = checks.reduce((sum, c) => sum + (c.criterion.score || 1), 0);
    const score = (totalScore / maxScore) * 10;

    return {
      stage,
      criteria,
      passed: requiredPassed && score >= 7,
      score: Math.round(score * 10) / 10
    };
  }

  /**
   * Get quality criteria for each stage
   */
  private getQualityCriteria(_stage: Stage) {
    // Basic criteria - can be extended
    return [
      {
        name: 'All agents completed',
        description: 'All required agents completed successfully',
        required: true,
        score: 3,
        check: async (result: StageResult) => {
          return result.agentOutputs.every(output => output.status === 'completed');
        }
      },
      {
        name: 'No errors',
        description: 'No errors reported',
        required: true,
        score: 2,
        check: async (result: StageResult) => {
          return !result.errors || result.errors.length === 0;
        }
      },
      {
        name: 'Data quality',
        description: 'Output data is valid and complete',
        required: false,
        score: 3,
        check: async (result: StageResult) => {
          return result.agentOutputs.every(output => output.data !== null);
        }
      },
      {
        name: 'Performance',
        description: 'Stage completed within reasonable time',
        required: false,
        score: 2,
        check: async (result: StageResult) => {
          // Max 10 minutes per stage
          return (result.durationMs || 0) < 600000;
        }
      }
    ];
  }

  /**
   * Determine if a stage is critical (cannot continue without it)
   */
  private isCriticalStage(stage: string): boolean {
    return ['data_ingestion', 'analysis', 'intelligence'].includes(stage);
  }

  /**
   * Determine overall status from stage results
   */
  private determineOverallStatus(results: StageResult[]): 'success' | 'partial' | 'failed' {
    const failed = results.filter(r => r.status === 'failed');

    if (failed.length === 0) {
      return 'success';
    }
    if (failed.some(r => this.isCriticalStage(r.stage))) {
      return 'failed';
    }
    return 'partial';
  }

  /**
   * Get stage number (1-6)
   */
  private getStageNumber(stage: Stage): number {
    const stages = [
      Stage.DATA_INGESTION,
      Stage.ANALYSIS,
      Stage.INTELLIGENCE,
      Stage.STRATEGY,
      Stage.VALIDATION,
      Stage.PRODUCTION
    ];
    return stages.indexOf(stage) + 1;
  }

  /**
   * Get human-readable stage name
   */
  private getStageName(stage: Stage): string {
    const names: Record<Stage, string> = {
      [Stage.DATA_INGESTION]: 'Data Ingestion & Extraction',
      [Stage.ANALYSIS]: 'Analysis & Synthesis',
      [Stage.INTELLIGENCE]: 'Strategic Intelligence Generation',
      [Stage.STRATEGY]: 'Content Generation & Documentation',
      [Stage.VALIDATION]: 'Quality Assurance & Validation',
      [Stage.PRODUCTION]: 'Production & Output Generation'
    };
    return names[stage];
  }
}
