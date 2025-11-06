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
  private getQualityCriteria(stage: Stage) {
    const basicCriteria = [
      {
        name: 'Majority agents completed',
        description: 'At least 60% of agents completed successfully',
        required: true,
        score: 3,
        check: async (result: StageResult) => {
          const completed = result.agentOutputs.filter(
            output => output.status === 'completed'
          ).length;
          const total = result.agentOutputs.length;
          return total === 0 || completed / total >= 0.6; // Allow 60% success rate
        },
      },
      {
        name: 'No errors',
        description: 'No errors reported',
        required: true,
        score: 2,
        check: async (result: StageResult) => {
          return !result.errors || result.errors.length === 0;
        },
      },
      {
        name: 'Data quality',
        description: 'Output data is valid and complete',
        required: false,
        score: 3,
        check: async (result: StageResult) => {
          return result.agentOutputs.every(output => output.data !== null);
        },
      },
      {
        name: 'Performance',
        description: 'Stage completed within reasonable time',
        required: false,
        score: 2,
        check: async (result: StageResult) => {
          // Max 10 minutes per stage
          return (result.durationMs || 0) < 600000;
        },
      },
    ];

    // Add stage-specific criteria
    if (stage === Stage.DATA_INGESTION) {
      basicCriteria.push({
        name: 'UX Audit Completeness',
        description: 'Ensures the UX audit contains all required sections',
        required: false,
        score: 4,
        check: async (result: StageResult) => {
          const uxAuditorOutput = result.agentOutputs.find(
            o => o.agentType === AgentType.UX_AUDITOR
          );
          if (!uxAuditorOutput || !uxAuditorOutput.data) {
            return true; // Not applicable or no data to check
          }
          const data = uxAuditorOutput.data as Record<string, unknown>;
          const requiredKeys = [
            'navigation',
            'visualDesign',
            'userFlow',
            'mobileExperience',
            'trustCredibility',
            'performance',
            'ctaEffectiveness',
            'accessibility',
          ];
          return requiredKeys.every(key => key in data);
        },
      });
    }

    return basicCriteria;
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
   * Generates summary document and extracts HTML/CSS/assets from Stage 6 agents
   */
  private async persistProductionOutputs(stageResults: StageResult[]): Promise<Array<{
    format: string;
    path: string;
  }>> {
    const outputs: Array<{ format: string; path: string }> = [];

    // Find the production stage result (but don't require it for document generation)
    const productionStage = stageResults.find(result => result.stage === Stage.PRODUCTION);

    // Create output directory
    const outputDir = resolve(process.cwd(), 'outputs');
    try {
      mkdirSync(outputDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Could not create output directory: ${(error as Error).message}`));
      return outputs;
    }

    // Generate markdown summary document for all implemented agents
    try {
      const summaryContent = this.generateMarkdownSummary(stageResults);
      const summaryPath = resolve(
        outputDir,
        `${this.config.brandContext.brandName.toLowerCase()}-analysis-${Date.now()}.md`
      );
      writeFileSync(summaryPath, summaryContent, 'utf-8');

      outputs.push({
        format: 'markdown',
        path: summaryPath
      });

      // Also generate JSON output for programmatic access
      const jsonPath = resolve(
        outputDir,
        `${this.config.brandContext.brandName.toLowerCase()}-data-${Date.now()}.json`
      );
      const jsonData = {
        brand: this.config.brandContext,
        stages: stageResults.map(result => ({
          stage: result.stage,
          status: result.status,
          duration: result.durationMs,
          agents: result.agentOutputs.map(output => ({
            type: output.agentType,
            status: output.status,
            data: output.data,
            tokens: output.metadata?.tokensUsed || 0
          }))
        })),
        totalTokens: this.totalTokensUsed,
        totalCost: this.totalCostUSD,
        generatedAt: new Date().toISOString()
      };
      writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

      outputs.push({
        format: 'json',
        path: jsonPath
      });
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Could not generate summary document: ${(error as Error).message}`));
    }

    // Process each production agent output (if production stage exists)
    if (productionStage && productionStage.status === StageStatus.COMPLETED) {
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
    }

    return outputs;
  }

  /**
   * Generate a markdown summary document of all agent outputs
   */
  private generateMarkdownSummary(stageResults: StageResult[]): string {
    const { brandName, category, currentRevenue, targetRevenue, website, competitors } = this.config.brandContext;

    let markdown = `# Brand Intelligence Report: ${brandName}\n\n`;
    markdown += `**Generated**: ${new Date().toLocaleString()}\n`;
    markdown += `**Category**: ${category}\n`;
    markdown += `**Current Revenue**: ${currentRevenue || 'N/A'}\n`;
    markdown += `**Target Revenue**: ${targetRevenue || 'N/A'}\n`;
    markdown += `**Website**: ${website || 'N/A'}\n`;
    markdown += `**Competitors**: ${competitors.join(', ') || 'N/A'}\n\n`;

    markdown += `## Executive Summary\n\n`;
    markdown += `This report presents a comprehensive brand intelligence analysis for ${brandName} `;
    markdown += `in the ${category} sector. The analysis was conducted using ${this.totalTokensUsed.toLocaleString()} `;
    markdown += `tokens at a cost of $${this.totalCostUSD.toFixed(2)}.\n\n`;

    // Summary statistics
    markdown += `### Analysis Statistics\n\n`;
    markdown += `- **Total Stages Completed**: ${stageResults.filter(r => r.status === StageStatus.COMPLETED).length}/${stageResults.length}\n`;
    markdown += `- **Total Agents Executed**: ${stageResults.reduce((sum, r) => sum + r.agentOutputs.length, 0)}\n`;
    markdown += `- **Successful Agents**: ${stageResults.reduce((sum, r) => sum + r.agentOutputs.filter(a => a.status === AgentStatus.COMPLETED).length, 0)}\n`;
    markdown += `- **Total Processing Time**: ${(stageResults.reduce((sum, r) => sum + (r.durationMs || 0), 0) / 1000).toFixed(1)}s\n\n`;

    markdown += `---\n\n`;

    // Detailed results for each stage
    for (const stageResult of stageResults) {
      const stageName = this.getStageName(stageResult.stage);
      const stageNum = this.getStageNumber(stageResult.stage);

      markdown += `## Stage ${stageNum}: ${stageName}\n\n`;
      markdown += `**Status**: ${stageResult.status}\n`;
      markdown += `**Duration**: ${((stageResult.durationMs || 0) / 1000).toFixed(1)}s\n`;
      markdown += `**Agents**: ${stageResult.agentOutputs.length}\n\n`;

      // Process each agent in the stage
      for (const agentOutput of stageResult.agentOutputs) {
        if (agentOutput.status !== AgentStatus.COMPLETED || !agentOutput.data) {
          continue;
        }

        const agentName = agentOutput.agentType
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        markdown += `### ${agentName}\n\n`;

        // Add agent metrics
        if (agentOutput.metadata) {
          markdown += `- **Tokens Used**: ${agentOutput.metadata.tokensUsed || 0}\n`;
          markdown += `- **Processing Time**: ${((agentOutput.metadata.durationMs || 0) / 1000).toFixed(1)}s\n`;
          if (agentOutput.metadata.confidence) {
            markdown += `- **Confidence**: ${(agentOutput.metadata.confidence * 100).toFixed(0)}%\n`;
          }
        }

        markdown += `\n**Analysis Results:**\n\n`;

        // Format agent data based on type
        try {
          const data = agentOutput.data;

          if (typeof data === 'object' && data !== null) {
            // Pretty print JSON data as code block
            markdown += '```json\n';
            markdown += JSON.stringify(data, null, 2);
            markdown += '\n```\n\n';
          } else {
            markdown += `${data}\n\n`;
          }
        } catch (error) {
          markdown += `*Data formatting error: ${(error as Error).message}*\n\n`;
        }
      }

      markdown += `---\n\n`;
    }

    // Add recommendations section (placeholder for now)
    markdown += `## Strategic Recommendations\n\n`;
    markdown += `Based on the analysis of ${brandName}, the following strategic recommendations emerge:\n\n`;
    markdown += `1. **Market Positioning**: Focus on differentiating factors identified in the analysis\n`;
    markdown += `2. **Growth Strategy**: Leverage opportunities in identified market segments\n`;
    markdown += `3. **Competitive Advantage**: Build on unique strengths relative to competitors\n`;
    markdown += `4. **Resource Allocation**: Optimize budget based on highest ROI channels\n\n`;

    markdown += `---\n\n`;
    markdown += `*Generated by Agentic Brand Builder v1.0.0-beta*\n`;

    return markdown;
  }
}
