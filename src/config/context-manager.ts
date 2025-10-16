import type { BrandContext, Stage, StageResult } from '../types/index.js';

/**
 * Context Manager - Maintains shared context across all agents and stages
 */
export class ContextManager {
  private brandContext: BrandContext;
  private stageOutputs: Map<Stage, StageResult>;
  private sharedData: Map<string, unknown>;

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
   */
  updateStageOutput(stage: Stage, result: StageResult): void {
    this.stageOutputs.set(stage, result);

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
  } {
    return {
      completedStages: this.stageOutputs.size,
      totalStages: 6,
      brandName: this.brandContext.brandName,
      category: this.brandContext.category
    };
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
