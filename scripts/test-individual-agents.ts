#!/usr/bin/env node
/**
 * Simple script to test individual agents with real brand data
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { CompetitorResearchAgent } from '../src/agents/stage1/competitor-research-agent.js';
import { FinancialProjectionAgent } from '../src/agents/stage2/financial-projection-agent.js';
import { PositioningStrategyAgent } from '../src/agents/stage3/positioning-strategy-agent.js';
import { ExecutiveSummaryWriterAgent } from '../src/agents/stage4/executive-summary-writer-agent.js';
import { AgentType } from '../src/types/index.js';
import type { BrandContext } from '../src/types/index.js';

config();

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found');
  process.exit(1);
}

async function testAgent(agentName: string, AgentClass: any, brandContext: BrandContext) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Testing: ${agentName}`);
  console.log(`${'='.repeat(80)}\n`);

  const startTime = Date.now();

  try {
    const config = {
      type: AgentType.COMPETITOR_RESEARCH,
      maxRetries: 2,
      timeout: 60000,
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.3
    };

    const agent = new AgentClass(config, apiKey);
    const result = await agent.execute({
      context: brandContext,
      previousStageOutputs: {}
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Status: ${result.status}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🔢 Tokens: ${result.metadata.tokensUsed || 'N/A'}`);
    console.log(`📊 Confidence: ${result.metadata.confidence || 'N/A'}`);

    console.log(`\n📄 Output Sample (first 500 chars):`);
    const dataStr = JSON.stringify(result.data, null, 2);
    console.log(dataStr.slice(0, 500) + (dataStr.length > 500 ? '...' : ''));

    return { success: true, duration, result };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`❌ Failed: ${(error as Error).message}`);
    console.log(`⏱️  Duration: ${duration}s`);
    return { success: false, duration, error };
  }
}

async function main() {
  const brandFile = process.argv[2] || 'examples/flyberry-context.json';

  console.log(`\n🚀 Testing Individual Agents`);
  console.log(`📁 Brand: ${brandFile}\n`);

  const brandData = JSON.parse(readFileSync(brandFile, 'utf-8'));
  const brandContext: BrandContext = {
    brandName: brandData.brandName,
    category: brandData.category,
    competitors: brandData.competitors || [],
    dataSources: brandData.dataSources || [],
    website: brandData.website,
    currentRevenue: brandData.currentRevenue,
    targetRevenue: brandData.targetRevenue,
    targetAudience: brandData.targetAudience,
    currentChallenges: brandData.currentChallenges,
    customInstructions: brandData.customInstructions
  };

  const results = [];

  // Test 1: Competitor Research Agent
  results.push(await testAgent(
    'Competitor Research Agent (Stage 1)',
    CompetitorResearchAgent,
    brandContext
  ));

  // Test 2: Financial Projection Agent
  results.push(await testAgent(
    'Financial Projection Agent (Stage 2)',
    FinancialProjectionAgent,
    brandContext
  ));

  // Test 3: Positioning Strategy Agent
  results.push(await testAgent(
    'Positioning Strategy Agent (Stage 3)',
    PositioningStrategyAgent,
    brandContext
  ));

  // Test 4: Executive Summary Writer Agent
  results.push(await testAgent(
    'Executive Summary Writer Agent (Stage 4)',
    ExecutiveSummaryWriterAgent,
    brandContext
  ));

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 Test Summary`);
  console.log(`${'='.repeat(80)}\n`);

  const successful = results.filter(r => r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + parseFloat(r.duration), 0).toFixed(2);

  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${results.length - successful}/${results.length}`);
  console.log(`⏱️  Total Duration: ${totalDuration}s`);
  console.log(`⚡ Avg Duration: ${(parseFloat(totalDuration) / results.length).toFixed(2)}s per agent\n`);

  if (successful === results.length) {
    console.log(`🎉 All agents working correctly!\n`);
    process.exit(0);
  } else {
    console.log(`⚠️  Some agents failed. Review errors above.\n`);
    process.exit(1);
  }
}

main().catch(console.error);
