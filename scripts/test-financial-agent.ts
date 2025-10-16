#!/usr/bin/env node
/**
 * Quick test for optimized Financial Projection Agent
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { FinancialProjectionAgent } from '../src/agents/stage2/financial-projection-agent.js';
import { AgentType } from '../src/types/index.js';

config();

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found');
  process.exit(1);
}

async function main() {
  console.log('\n🧪 Testing Optimized Financial Projection Agent\n');
  console.log('Improvements:');
  console.log('  - Reduced prompt: ~285 lines → ~50 lines');
  console.log('  - Reduced maxTokens: 10000 → 4000');
  console.log('  - Simplified JSON structure\n');

  const brandFile = process.argv[2] || 'examples/flyberry-context.json';
  const brandData = JSON.parse(readFileSync(brandFile, 'utf-8'));

  const startTime = Date.now();

  try {
    const config = {
      type: AgentType.FINANCIAL_PROJECTION,
      maxRetries: 2,
      timeout: 60000,
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.3
    };

    const agent = new FinancialProjectionAgent(config, apiKey);
    const result = await agent.execute({
      context: brandData,
      previousStageOutputs: {}
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Status: ${result.status}`);
    console.log(`⏱️  Duration: ${duration}s (target: <30s)`);
    console.log(`🔢 Tokens: ${result.metadata.tokensUsed || 'N/A'}`);
    console.log(`📊 Confidence: ${result.metadata.confidence || 'N/A'}`);

    if (parseFloat(duration) < 30) {
      console.log(`\n🎉 Performance IMPROVED! (${duration}s < 30s target)`);
    } else if (parseFloat(duration) < 60) {
      console.log(`\n⚠️  Performance OK but needs more optimization (${duration}s)`);
    } else {
      console.log(`\n❌ Still too slow (${duration}s > 60s)`);
    }

    console.log(`\n📄 Output Sample:`);
    const dataStr = JSON.stringify(result.data, null, 2);
    console.log(dataStr.slice(0, 800) + (dataStr.length > 800 ? '\n...' : ''));

    process.exit(0);
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n❌ Failed after ${duration}s`);
    console.log(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
