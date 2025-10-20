import type { BrandContext, StageResult } from '../types/index.js';
import { Stage } from '../types/index.js';

/**
 * Context Manager - Maintains shared context across all agents and stages
 * Includes memory management to prevent unbounded growth
 */
export class ContextManager {
  private brandContext: BrandContext;
  private stageOutputs: Map<Stage, StageResult>;
  private sharedData: Map<string, unknown>;
  private currentMemorySize: number = 0;
  private readonly MAX_MEMORY_SIZE = 50 * 1024 * 1024; // 50MB limit
  private readonly STAGE_MEMORY_WARNING = 10 * 1024 * 1024; // 10MB per stage warning

  constructor(brandContext: BrandContext) {
    this.brandContext = brandContext;
    this.stageOutputs = new Map();
    this.sharedData = new Map();
  }

  /**
   * Get brand context
   */
  getBrandContext(): BrandContext {
    return this.brandContext;
  }

  /**
   * Update brand context
   */
  updateBrandContext(updates: Partial<BrandContext>): void {
    this.brandContext = {
      ...this.brandContext,
      ...updates
    };
  }

  /**
   * Store output from a completed stage
   * Includes memory management to prevent OOM errors
   */
  updateStageOutput(stage: Stage, result: StageResult): void {
    // Estimate memory size of the result
    const resultSize = this.estimateSize(result);

    // Check if this stage's data is too large
    if (resultSize > this.STAGE_MEMORY_WARNING) {
      console.warn(
        `⚠️  Stage ${stage} data is ${(resultSize / 1024 / 1024).toFixed(2)}MB. ` +
        'Consider optimizing data storage or implementing data summarization.'
      );
    }

    // Check if we're approaching memory limit
    if (this.currentMemorySize + resultSize > this.MAX_MEMORY_SIZE) {
      console.warn(
        `⚠️  Memory usage (${(this.currentMemorySize / 1024 / 1024).toFixed(2)}MB) ` +
        `approaching limit (${(this.MAX_MEMORY_SIZE / 1024 / 1024).toFixed(2)}MB). ` +
        'Compressing older stage data...'
      );
      this.compressOldStages();
    }

    this.stageOutputs.set(stage, result);
    this.currentMemorySize += resultSize;

    // Extract key data from agent outputs and store in shared data
    const stageData: Record<string, unknown> = {};

    for (const agentOutput of result.agentOutputs) {
      if (agentOutput.status === 'completed' && agentOutput.data) {
        stageData[agentOutput.agentType] = agentOutput.data;
      }
    }

    this.sharedData.set(stage, stageData);
  }

  /**
   * Get output from a specific stage
   */
  getStageOutput(stage: Stage): StageResult | undefined {
    return this.stageOutputs.get(stage);
  }

  /**
   * Get all stage outputs as a flat object
   */
  getAllStageOutputs(): Record<string, unknown> {
    const allOutputs: Record<string, unknown> = {};

    for (const [stage, data] of this.sharedData.entries()) {
      allOutputs[stage] = data;
    }

    return allOutputs;
  }

  /**
   * Get shared data by key
   */
  getSharedData(key: string): unknown {
    return this.sharedData.get(key);
  }

  /**
   * Set shared data
   */
  setSharedData(key: string, value: unknown): void {
    this.sharedData.set(key, value);
  }

  /**
   * Check if a stage has been completed
   */
  isStageCompleted(stage: Stage): boolean {
    const result = this.stageOutputs.get(stage);
    return result?.status === 'completed';
  }

  /**
   * Get completion summary
   */
  getSummary(): {
    completedStages: number;
    totalStages: number;
    brandName: string;
    category: string;
    memoryUsageMB: number;
    } {
    return {
      completedStages: this.stageOutputs.size,
      totalStages: 6,
      brandName: this.brandContext.brandName,
      category: this.brandContext.category,
      memoryUsageMB: Number((this.currentMemorySize / 1024 / 1024).toFixed(2))
    };
  }

  /**
   * Estimate memory size of an object (rough approximation)
   */
  private estimateSize(obj: unknown): number {
    try {
      const jsonString = JSON.stringify(obj);
      // Rough estimate: 2 bytes per character (UTF-16)
      return jsonString.length * 2;
    } catch {
      // If can't stringify, return conservative estimate
      return 1024 * 1024; // 1MB default
    }
  }

  /**
   * Compress old stage data to free memory
   * Keeps only essential summary information for older stages
   */
  private compressOldStages(): void {
    const stages = [Stage.DATA_INGESTION, Stage.ANALYSIS, Stage.INTELLIGENCE];

    for (const stage of stages) {
      const stageResult = this.stageOutputs.get(stage);
      if (!stageResult) {
        continue;
      }

      // Compress agent outputs - keep only metadata, remove large data
      const compressedResult: StageResult = {
        ...stageResult,
        agentOutputs: stageResult.agentOutputs.map(output => ({
          ...output,
          data: {
            compressed: true,
            summary: `${output.agentType} completed successfully`,
            originalSize: this.estimateSize(output.data)
          }
        }))
      };

      const oldSize = this.estimateSize(stageResult);
      const newSize = this.estimateSize(compressedResult);

      this.stageOutputs.set(stage, compressedResult);
      this.currentMemorySize = this.currentMemorySize - oldSize + newSize;

      console.log(
        `Compressed ${stage}: ${(oldSize / 1024 / 1024).toFixed(2)}MB → ` +
        `${(newSize / 1024 / 1024).toFixed(2)}MB`
      );
    }
  }

  /**
   * Export context for persistence
   */
  export(): {
    brandContext: BrandContext;
    stageResults: Record<string, StageResult>;
    sharedData: Record<string, unknown>;
    } {
    return {
      brandContext: this.brandContext,
      stageResults: Object.fromEntries(this.stageOutputs),
      sharedData: Object.fromEntries(this.sharedData)
    };
  }

  /**
   * Import context from saved state
   */
  import(data: {
    brandContext: BrandContext;
    stageResults: Record<string, StageResult>;
    sharedData: Record<string, unknown>;
  }): void {
    this.brandContext = data.brandContext;
    this.stageOutputs = new Map(Object.entries(data.stageResults) as [Stage, StageResult][]);
    this.sharedData = new Map(Object.entries(data.sharedData));
  }
}
