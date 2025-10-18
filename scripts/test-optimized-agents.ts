#!/usr/bin/env node
/**
 * Test script for optimized agents with Flyberry brand
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { MarketIntelligenceAgent } from '../src/agents/stage1/market-intelligence-agent.js';
import { ExecutiveSummaryWriterAgent } from '../src/agents/stage4/executive-summary-writer-agent.js';
import { ConsistencyCheckerAgent } from '../src/agents/stage5/consistency-checker-agent.js';
import { RoadmapPlanningAgent } from '../src/agents/stage3/roadmap-planning-agent.js';
import { AgentType } from '../src/types/index.js';

config();

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found');
  process.exit(1);
}

interface TestResult {
  agent: string;
  status: string;
  duration: number;
  tokens?: number;
  confidence?: number;
  success: boolean;
}

async function testAgent(
  agentName: string,
  AgentClass: any,
  agentType: AgentType,
  brandContext: any
): Promise<TestResult> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Testing: ${agentName}`);
  console.log(`${'='.repeat(80)}\n`);

  const startTime = Date.now();

  try {
    const config = {
      type: agentType,
      maxRetries: 2,
      timeout: 90000, // 90 seconds
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.3
    };

    const agent = new AgentClass(config, apiKey);
    const result = await agent.execute({
      context: brandContext,
      previousStageOutputs: {}
    });

    const duration = (Date.now() - startTime) / 1000;

    console.log(`✅ Status: ${result.status}`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`🔢 Tokens: ${result.metadata.tokensUsed || 'N/A'}`);
    console.log(`📊 Confidence: ${result.metadata.confidence || 'N/A'}`);

    if (duration < 30) {
      console.log(`\n🎉 Excellent! (${duration.toFixed(2)}s < 30s target)`);
    } else if (duration < 60) {
      console.log(`\n✅ Good performance (${duration.toFixed(2)}s < 60s acceptable)`);
    } else {
      console.log(`\n⚠️  Needs more optimization (${duration.toFixed(2)}s > 60s)`);
    }

    console.log(`\n📄 Output Sample:`);
    const dataStr = JSON.stringify(result.data, null, 2);
    console.log(dataStr.slice(0, 500) + (dataStr.length > 500 ? '\n...' : ''));

    return {
      agent: agentName,
      status: result.status,
      duration,
      tokens: result.metadata.tokensUsed,
      confidence: result.metadata.confidence,
      success: result.status === 'completed'
    };
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n❌ Failed after ${duration.toFixed(2)}s`);
    console.log(`Error: ${(error as Error).message}`);

    return {
      agent: agentName,
      status: 'failed',
      duration,
      success: false
    };
  }
}

async function main() {
  console.log('\n🚀 Testing Optimized Agents with Flyberry Gourmet\n');
  console.log('Optimizations Applied:');
  console.log('  - Market Intelligence: 318→178 lines, 10K→6K tokens (44% reduction)');
  console.log('  - Executive Summary: 429→130 lines, 12K→6K tokens (70% reduction)');
  console.log('  - Consistency Checker: 396→172 lines, 10K→5K tokens (56% reduction)');
  console.log('  - Roadmap Planning: 390→187 lines, 12K→6K tokens (52% reduction)\n');

  const brandFile = 'examples/flyberry-context.json';
  const brandData = JSON.parse(readFileSync(brandFile, 'utf-8'));

  const results: TestResult[] = [];

  // Test each optimized agent
  const agents = [
    {
      name: 'Market Intelligence Agent',
      class: MarketIntelligenceAgent,
      type: AgentType.MARKET_INTELLIGENCE
    },
    {
      name: 'Executive Summary Writer Agent',
      class: ExecutiveSummaryWriterAgent,
      type: AgentType.EXECUTIVE_SUMMARY_WRITER
    },
    {
      name: 'Consistency Checker Agent',
      class: ConsistencyCheckerAgent,
      type: AgentType.CONSISTENCY_CHECKER
    },
    {
      name: 'Roadmap Planning Agent',
      class: RoadmapPlanningAgent,
      type: AgentType.ROADMAP_PLANNING
    }
  ];

  for (const agent of agents) {
    const result = await testAgent(agent.name, agent.class, agent.type, brandData);
    results.push(result);
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(80)}\n`);

  const successful = results.filter((r) => r.success).length;
  const avgDuration =
    results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const totalTokens = results.reduce((sum, r) => sum + (r.tokens || 0), 0);

  console.log(`✅ Success Rate: ${successful}/${results.length} (${((successful / results.length) * 100).toFixed(0)}%)`);
  console.log(`⏱️  Average Duration: ${avgDuration.toFixed(2)}s`);
  console.log(`🔢 Total Tokens: ${totalTokens.toLocaleString()}\n`);

  console.log('Results by Agent:');
  results.forEach((r) => {
    const status = r.success ? '✅' : '❌';
    const perf = r.duration < 30 ? '🎉' : r.duration < 60 ? '✅' : '⚠️';
    console.log(
      `  ${status} ${perf} ${r.agent}: ${r.duration.toFixed(2)}s, ${r.tokens || 'N/A'} tokens, conf: ${r.confidence || 'N/A'}`
    );
  });

  console.log('\n');
  process.exit(successful === results.length ? 0 : 1);
}

main();
