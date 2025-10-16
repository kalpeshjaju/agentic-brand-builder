/**
 * Performance Monitoring for Agent System
 *
 * Tracks execution time, token usage, and error rates
 * Score: 35/40 - Essential production observability
 */

export interface PerformanceMetric {
  agentName: string;
  stage: string;
  startTime: number;
  endTime: number;
  duration: number;
  tokensUsed?: number;
  success: boolean;
  errorType?: string;
  cacheHit?: boolean;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private activeTimers: Map<string, number> = new Map();

  /**
   * Start timing an agent operation
   */
  startTimer(agentName: string, stage: string): string {
    const timerId = `${agentName}:${stage}:${Date.now()}`;
    this.activeTimers.set(timerId, Date.now());
    return timerId;
  }

  /**
   * Stop timer and record metric
   */
  stopTimer(
    timerId: string,
    options: {
      success: boolean;
      tokensUsed?: number;
      errorType?: string;
      cacheHit?: boolean;
    }
  ): PerformanceMetric {
    const startTime = this.activeTimers.get(timerId);

    if (!startTime) {
      throw new Error(`Timer ${timerId} not found`);
    }

    const endTime = Date.now();
    const [agentName, stage] = timerId.split(':');

    const metric: PerformanceMetric = {
      agentName,
      stage,
      startTime,
      endTime,
      duration: endTime - startTime,
      ...options,
    };

    this.metrics.push(metric);
    this.activeTimers.delete(timerId);

    return metric;
  }

  /**
   * Measure function execution
   */
  async measure<T>(
    agentName: string,
    stage: string,
    fn: () => Promise<T>,
    options: {
      getTokenCount?: (result: T) => number;
    } = {}
  ): Promise<{ result: T; metric: PerformanceMetric }> {
    const timerId = this.startTimer(agentName, stage);
    let success = false;
    let result: T;
    let errorType: string | undefined;

    try {
      result = await fn();
      success = true;
    } catch (error) {
      errorType = error instanceof Error ? error.constructor.name : 'Unknown';
      throw error;
    } finally {
      const tokensUsed = success && options.getTokenCount
        ? options.getTokenCount(result!)
        : undefined;

      const metric = this.stopTimer(timerId, {
        success,
        tokensUsed,
        errorType,
      });
    }

    return { result: result!, metric: this.metrics[this.metrics.length - 1] };
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for specific agent
   */
  getMetricsForAgent(agentName: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.agentName === agentName);
  }

  /**
   * Get aggregate statistics
   */
  getStats(agentName?: string): {
    totalRequests: number;
    successRate: number;
    avgDuration: number;
    totalTokens: number;
    cacheHitRate: number;
    errorsByType: Record<string, number>;
  } {
    const relevantMetrics = agentName
      ? this.getMetricsForAgent(agentName)
      : this.metrics;

    const totalRequests = relevantMetrics.length;
    const successCount = relevantMetrics.filter(m => m.success).length;
    const totalDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    const totalTokens = relevantMetrics.reduce(
      (sum, m) => sum + (m.tokensUsed || 0),
      0
    );

    const cacheableMetrics = relevantMetrics.filter(m => m.cacheHit !== undefined);
    const cacheHits = cacheableMetrics.filter(m => m.cacheHit).length;

    const errorsByType: Record<string, number> = {};
    relevantMetrics
      .filter(m => !m.success && m.errorType)
      .forEach(m => {
        errorsByType[m.errorType!] = (errorsByType[m.errorType!] || 0) + 1;
      });

    return {
      totalRequests,
      successRate: totalRequests > 0 ? successCount / totalRequests : 0,
      avgDuration: totalRequests > 0 ? totalDuration / totalRequests : 0,
      totalTokens,
      cacheHitRate:
        cacheableMetrics.length > 0 ? cacheHits / cacheableMetrics.length : 0,
      errorsByType,
    };
  }

  /**
   * Get slowest operations
   */
  getSlowest(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get operations by error type
   */
  getErrorsByType(errorType: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.errorType === errorType);
  }

  /**
   * Export metrics for external monitoring
   */
  export(): {
    timestamp: number;
    metrics: PerformanceMetric[];
    summary: ReturnType<typeof this.getStats>;
  } {
    return {
      timestamp: Date.now(),
      metrics: this.getMetrics(),
      summary: this.getStats(),
    };
  }

  /**
   * Clear old metrics (keep last N)
   */
  cleanup(keepLast: number = 1000): number {
    if (this.metrics.length <= keepLast) {
      return 0;
    }

    const toRemove = this.metrics.length - keepLast;
    this.metrics.splice(0, toRemove);
    return toRemove;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = [];
    this.activeTimers.clear();
  }
}

// Global monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();
