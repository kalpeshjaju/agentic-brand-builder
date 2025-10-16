#!/usr/bin/env node
/**
 * Test optimized agents with Flyberry
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { MarketIntelligenceAgent } from '../src/agents/stage1/market-intelligence-agent.js';
import { AgentType } from '../src/types/index.js';

config();

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found');
  process.exit(1);
}

async function main() {
  console.log('\n🧪 Testing Optimized Market Intelligence Agent with Flyberry\n');
  console.log('Optimization: 318→178 lines (44%), 10K→6K tokens (40%)\n');

  const brandData = JSON.parse(readFileSync('examples/flyberry-context.json', 'utf-8'));
  const startTime = Date.now();

  try {
    const agent = new MarketIntelligenceAgent(
      {
        type: AgentType.MARKET_INTELLIGENCE,
        maxRetries: 2,
        timeout: 90000,
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
    } else {
      console.log(`\n⚠️  Needs optimization (${duration}s > 60s)`);
    }

    console.log(`\n📄 Output Sample:`);
    console.log(JSON.stringify(result.data, null, 2).slice(0, 800) + '\n...');

    process.exit(0);
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n❌ Failed after ${duration}s`);
    console.log(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
