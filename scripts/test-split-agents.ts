#!/usr/bin/env node
/**
 * Test split Market Intelligence agents (Market Overview + Market Dynamics)
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { MarketOverviewAgent } from '../src/agents/stage1/market-overview-agent.js';
import { MarketDynamicsAgent } from '../src/agents/stage1/market-dynamics-agent.js';
import { AgentType } from '../src/types/index.js';

config();

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found');
  process.exit(1);
}

async function testAgent(name: string, AgentClass: any, agentType: AgentType, brandData: any) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Testing: ${name}`);
  console.log(`${'='.repeat(80)}\n`);

  const startTime = Date.now();

  try {
    const agent = new AgentClass(
      {
        type: agentType,
        maxRetries: 1,
        timeout: 240000, // 4 minutes for analytical agents
        model: 'claude-sonnet-4-5-20250929',
        temperature: 0.3
      },
      apiKey
    );

    const result = await agent.execute({
      context: brandData,
      previousStageOutputs: {}
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Status: ${result.status}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🔢 Tokens: ${result.metadata.tokensUsed || 'N/A'}`);
    console.log(`📊 Confidence: ${result.metadata.confidence || 'N/A'}`);

    if (parseFloat(duration) < 30) {
      console.log(`\n🎉 Excellent! (${duration}s < 30s target)`);
    } else if (parseFloat(duration) < 60) {
      console.log(`\n✅ Good (${duration}s < 60s acceptable)`);
    }

    console.log(`\n📄 Output Sample:`);
    console.log(JSON.stringify(result.data, null, 2).slice(0, 600) + '\n...');

    return {
      name,
      duration: parseFloat(duration),
      tokens: result.metadata.tokensUsed,
      confidence: result.metadata.confidence,
      success: result.status === 'completed'
    };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n❌ Failed after ${duration}s`);
    console.log(`Error: ${(error as Error).message}`);

    return { name, duration: parseFloat(duration), success: false };
  }
}

async function main() {
  console.log('\n🚀 Testing Split Market Intelligence Agents\n');
  console.log('Split Strategy:');
  console.log('  1. Market Overview: TAM/SAM/SOM, growth, segments (3K tokens)');
  console.log('  2. Market Dynamics: Trends, competition, opportunities (4K tokens)');
  console.log('  Total: 7K tokens vs Original 6K (but split for reliability)\n');

  const brandData = JSON.parse(readFileSync('examples/flyberry-context.json', 'utf-8'));

  const results = [];

  // Test Market Overview
  results.push(await testAgent(
    'Market Overview Agent',
    MarketOverviewAgent,
    AgentType.MARKET_OVERVIEW,
    brandData
  ));

  // Test Market Dynamics
  results.push(await testAgent(
    'Market Dynamics Agent',
    MarketDynamicsAgent,
    AgentType.MARKET_DYNAMICS,
    brandData
  ));

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(80)}\n`);

  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const avgDuration = totalDuration / results.length;
  const allSuccess = results.every((r) => r.success);

  console.log(`✅ Both agents completed: ${allSuccess ? 'YES' : 'NO'}`);
  console.log(`⏱️  Total time: ${totalDuration.toFixed(2)}s (vs 273s original)`);
  console.log(`⏱️  Average per agent: ${avgDuration.toFixed(2)}s`);
  console.log(`🎯 Improvement: ${(((273 - totalDuration) / 273) * 100).toFixed(1)}% faster\n`);

  results.forEach((r) => {
    const status = r.success ? '✅' : '❌';
    const perf = r.duration < 30 ? '🎉' : r.duration < 60 ? '✅' : '⚠️';
    console.log(`  ${status} ${perf} ${r.name}: ${r.duration.toFixed(2)}s`);
  });

  console.log('\n');
  process.exit(allSuccess ? 0 : 1);
}

main();
