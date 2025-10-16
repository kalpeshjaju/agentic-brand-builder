/**
 * Agent Output Caching System
 *
 * Caches agent results to reduce API costs and improve response time.
 * Score: 38/40 - High value, low implementation complexity
 */

import type { AgentInput, AgentOutput } from '../types/index.js';

export interface CacheEntry {
  input: AgentInput;
  output: AgentOutput;
  timestamp: number;
  hash: string;
}

export class AgentCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL: number;

  constructor(ttlMs: number = 3600000) { // 1 hour default
    this.defaultTTL = ttlMs;
  }

  /**
   * Generate cache key from agent input
   */
  private generateHash(agentType: string, input: AgentInput): string {
    const key = JSON.stringify({
      type: agentType,
      brand: input.brand,
      context: input.context
    });

    return this.simpleHash(key);
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached result if available and fresh
   */
  get(agentType: string, input: AgentInput): AgentOutput | null {
    const hash = this.generateHash(agentType, input);
    const entry = this.cache.get(hash);

    if (!entry) {
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > this.defaultTTL) {
      this.cache.delete(hash);
      return null;
    }

    return entry.output;
  }

  /**
   * Store agent result in cache
   */
  set(agentType: string, input: AgentInput, output: AgentOutput): void {
    const hash = this.generateHash(agentType, input);
    const entry: CacheEntry = {
      input,
      output,
      timestamp: Date.now(),
      hash
    };

    this.cache.set(hash, entry);
  }

  /**
   * Check if result is cached
   */
  has(agentType: string, input: AgentInput): boolean {
    return this.get(agentType, input) !== null;
  }

  /**
   * Clear expired entries
   */
  cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [hash, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.defaultTTL) {
        this.cache.delete(hash);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    let oldest = Date.now();
    let newest = 0;

    for (const entry of this.cache.values()) {
      if (entry.timestamp < oldest) oldest = entry.timestamp;
      if (entry.timestamp > newest) newest = entry.timestamp;
    }

    return {
      size: this.cache.size,
      oldestEntry: oldest,
      newestEntry: newest
    };
  }
}

// Global cache instance for all agents
export const globalAgentCache = new AgentCache();
