import type {
  OrchestrationConfig,
  OrchestrationResult,
  StageResult,
  QualityGate
} from '../types/index.js';
import { Stage, StageStatus, AgentStatus, AgentType } from '../types/index.js';
import { StageOrchestrator } from '../stages/stage-orchestrator.js';
import { ContextManager } from '../config/context-manager.js';
import chalk from 'chalk';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

/**
 * Master Orchestrator - Coordinates all 6 stages of brand intelligence generation
 * Includes cost tracking and budget controls
 */
export class MasterOrchestrator {
  private config: OrchestrationConfig;
  private contextManager: ContextManager;
  private stageOrchestrator: StageOrchestrator;
  private totalTokensUsed: number = 0;
  private totalCostUSD: number = 0;
  // Default budget: 500K tokens (~$1.50 for Claude Sonnet)
  private readonly maxTokenBudget: number = 500_000;
  private readonly costPerMillionTokens: number = 3.00; // Claude Sonnet pricing

  constructor(config: OrchestrationConfig, apiKey: string, maxTokenBudget?: number) {
    this.config = config;
    this.contextManager = new ContextManager(config.brandContext);
    this.stageOrchestrator = new StageOrchestrator(apiKey, config.parallelAgents);
    if (maxTokenBudget) {
      this.maxTokenBudget = maxTokenBudget;
    }
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

        // Track token usage and cost
        const stageTokens = stageResult.agentOutputs.reduce(
          (sum, output) => sum + (output.metadata.tokensUsed || 0),
          0
        );
        this.totalTokensUsed += stageTokens;
        this.totalCostUSD = (this.totalTokensUsed / 1_000_000) * this.costPerMillionTokens;

        // Display cost tracking
        console.log(chalk.gray(
          `💰 Stage tokens: ${stageTokens.toLocaleString()} | ` +
          `Total: ${this.totalTokensUsed.toLocaleString()}/${this.maxTokenBudget.toLocaleString()} ` +
          `($${this.totalCostUSD.toFixed(2)})`
        ));

        // Check budget limit
        if (this.totalTokensUsed > this.maxTokenBudget) {
          throw new Error(
            `Budget exceeded: ${this.totalTokensUsed.toLocaleString()} tokens used ` +
            `(limit: ${this.maxTokenBudget.toLocaleString()}). ` +
            `Cost: $${this.totalCostUSD.toFixed(2)}. Stopping orchestration to prevent runaway costs.`
          );
        }

        // Warn if approaching budget (80% threshold)
        const budgetUsagePercent = (this.totalTokensUsed / this.maxTokenBudget) * 100;
        if (budgetUsagePercent >= 80 && budgetUsagePercent < 100) {
          console.log(chalk.yellow(
            `⚠️  Warning: ${budgetUsagePercent.toFixed(1)}% of token budget used. ` +
            `Remaining: ${(this.maxTokenBudget - this.totalTokensUsed).toLocaleString()} tokens`
          ));
        }

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

      // Extract and persist production artifacts from Stage 6
      const outputs = await this.persistProductionOutputs(stageResults);

      console.log(chalk.bold.green(`\n✅ Orchestration completed in ${(totalDurationMs / 1000).toFixed(2)}s`));
      console.log(chalk.green(
        `💰 Total cost: $${this.totalCostUSD.toFixed(2)} ` +
        `(${this.totalTokensUsed.toLocaleString()} tokens)`
      ));
      if (outputs.length > 0) {
        console.log(chalk.green(`📦 Generated ${outputs.length} output file(s):`));
        outputs.forEach(output => console.log(chalk.gray(`   - ${output.path}`)));
      }

      return {
        brandContext: this.config.brandContext,
        stageResults,
        overallStatus,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        totalDurationMs,
        outputs
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

  /**
   * Persist production outputs to disk
   * Extracts HTML/CSS/assets from Stage 6 agents and writes them to files
   */
  private async persistProductionOutputs(stageResults: StageResult[]): Promise<Array<{
    format: string;
    path: string;
  }>> {
    const outputs: Array<{ format: string; path: string }> = [];

    // Find the production stage result
    const productionStage = stageResults.find(result => result.stage === Stage.PRODUCTION);
    if (!productionStage || productionStage.status !== StageStatus.COMPLETED) {
      // No production stage or it failed, return empty
      return outputs;
    }

    // Create output directory
    const outputDir = resolve(process.cwd(), 'outputs');
    try {
      mkdirSync(outputDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Could not create output directory: ${(error as Error).message}`));
      return outputs;
    }

    // Process each production agent output
    for (const agentOutput of productionStage.agentOutputs) {
      try {
        // Only process successful outputs
        if (agentOutput.status !== AgentStatus.COMPLETED || !agentOutput.data) {
          continue;
        }

        // Handle HTML Generator output
        if (agentOutput.agentType === AgentType.HTML_GENERATOR) {
          const data = agentOutput.data as {
            html?: {
              filename?: string;
              content?: string;
            };
          };

          if (data.html?.content && data.html?.filename) {
            const filePath = resolve(outputDir, data.html.filename);
            writeFileSync(filePath, data.html.content, 'utf-8');

            outputs.push({
              format: 'html',
              path: filePath
            });
          }
        }

        // Future: Handle PDF_GENERATOR, ASSET_OPTIMIZER when implemented
        // if (agentOutput.agentType === AgentType.PDF_GENERATOR) { ... }

      } catch (error) {
        console.log(chalk.yellow(
          `⚠️  Could not persist output from ${agentOutput.agentType}: ${(error as Error).message}`
        ));
      }
    }

    return outputs;
  }
}
