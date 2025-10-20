#!/usr/bin/env tsx
/**
 * Health Check Script
 * Verifies all systems are operational before running orchestration
 */

import { config } from 'dotenv';
import chalk from 'chalk';
import Anthropic from '@anthropic-ai/sdk';

config();

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const checks: HealthCheck[] = [];

async function runHealthChecks(): Promise<void> {
  console.log(chalk.bold.blue('\n🏥 Running Health Checks...\n'));

  // Check 1: Environment Variables
  if (process.env.ANTHROPIC_API_KEY) {
    checks.push({
      name: 'API Key',
      status: 'pass',
      message: 'ANTHROPIC_API_KEY is set'
    });
  } else {
    checks.push({
      name: 'API Key',
      status: 'fail',
      message: 'ANTHROPIC_API_KEY is missing'
    });
  }

  // Check 2: API Key Format
  if (process.env.ANTHROPIC_API_KEY) {
    if (process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-api03-')) {
      checks.push({
        name: 'API Key Format',
        status: 'pass',
        message: 'API key format is correct'
      });
    } else {
      checks.push({
        name: 'API Key Format',
        status: 'warn',
        message: 'API key format may be incorrect'
      });
    }
  }

  // Check 3: API Connectivity
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }]
      });
      checks.push({
        name: 'API Connectivity',
        status: 'pass',
        message: 'Successfully connected to Anthropic API'
      });
    } catch (error) {
      checks.push({
        name: 'API Connectivity',
        status: 'fail',
        message: `Failed to connect: ${(error as Error).message}`
      });
    }
  }

  // Check 4: Node Version
  const nodeVersion = process.versions.node;
  const [major] = nodeVersion.split('.').map(Number);
  if (major >= 18) {
    checks.push({
      name: 'Node Version',
      status: 'pass',
      message: `Node v${nodeVersion} (>= 18 required)`
    });
  } else {
    checks.push({
      name: 'Node Version',
      status: 'fail',
      message: `Node v${nodeVersion} (need >= 18)`
    });
  }

  // Check 5: Memory
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  
  checks.push({
    name: 'Memory',
    status: 'pass',
    message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB`
  });

  // Print Results
  console.log(chalk.bold('Health Check Results:\n'));
  
  let hasFailures = false;
  let hasWarnings = false;

  for (const check of checks) {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️ ' : '❌';
    const color = check.status === 'pass' ? chalk.green : check.status === 'warn' ? chalk.yellow : chalk.red;
    
    console.log(`${icon} ${chalk.bold(check.name)}: ${color(check.message)}`);
    
    if (check.status === 'fail') {
      hasFailures = true;
    }
    if (check.status === 'warn') {
      hasWarnings = true;
    }
  }

  console.log('');

  if (hasFailures) {
    console.log(chalk.red.bold('❌ Health check FAILED. Fix issues before running orchestration.'));
    process.exit(1);
  } else if (hasWarnings) {
    console.log(chalk.yellow.bold('⚠️  Health check passed with warnings. Review before proceeding.'));
    process.exit(0);
  } else {
    console.log(chalk.green.bold('✅ All health checks passed! System is ready.'));
    process.exit(0);
  }
}

// Run checks
runHealthChecks().catch((error) => {
  console.error(chalk.red('Health check script error:'), error);
  process.exit(1);
});
