#!/usr/bin/env tsx

/**
 * Health Check Script
 *
 * Verifies that the agentic-brand-builder system is properly configured and operational.
 * Used by CI/CD workflows to ensure system health.
 */

import { config } from 'dotenv';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { resolve } from 'path';

config();

interface HealthCheck {
  name: string;
  check: () => Promise<boolean | string>;
  required: boolean;
}

const healthChecks: HealthCheck[] = [
  {
    name: 'Environment Variables',
    required: true,
    check: async () => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return 'ANTHROPIC_API_KEY not set';
      }
      if (!apiKey.startsWith('sk-ant-')) {
        return 'ANTHROPIC_API_KEY format invalid';
      }
      return true;
    }
  },
  {
    name: 'TypeScript Compilation',
    required: true,
    check: async () => {
      const { execSync } = await import('child_process');
      try {
        execSync('npm run type-check', { stdio: 'pipe' });
        return true;
      } catch (error) {
        return 'Type errors detected';
      }
    }
  },
  {
    name: 'Linting',
    required: true,
    check: async () => {
      const { execSync } = await import('child_process');
      try {
        execSync('npm run lint', { stdio: 'pipe' });
        return true;
      } catch (error) {
        return 'Lint errors detected';
      }
    }
  },
  {
    name: 'Required Directories',
    required: true,
    check: async () => {
      const dirs = ['src', 'src/agents', 'src/orchestrator', 'src/types', 'src/config'];
      for (const dir of dirs) {
        if (!existsSync(resolve(dir))) {
          return `Missing directory: ${dir}`;
        }
      }
      return true;
    }
  },
  {
    name: 'Example Brand Context',
    required: false,
    check: async () => {
      const examplePath = resolve('examples/brand-context-example.json');
      if (!existsSync(examplePath)) {
        return 'Example brand context not found';
      }
      return true;
    }
  },
  {
    name: 'Tests',
    required: false,
    check: async () => {
      const { execSync } = await import('child_process');
      try {
        const output = execSync('npm test -- --run', { stdio: 'pipe' }).toString();
        if (output.includes('No test files found')) {
          return 'No test files found';
        }
        return true;
      } catch (error) {
        return 'Tests failed';
      }
    }
  }
];

async function runHealthChecks(): Promise<void> {
  console.log(chalk.bold.blue('\n🏥 Running Health Checks...\n'));

  let passedRequired = 0;
  let failedRequired = 0;
  let passedOptional = 0;
  let failedOptional = 0;

  for (const healthCheck of healthChecks) {
    const result = await healthCheck.check();
    const passed = result === true;

    if (passed) {
      console.log(chalk.green(`✓ ${healthCheck.name}`));
      if (healthCheck.required) {
        passedRequired++;
      } else {
        passedOptional++;
      }
    } else {
      const message = typeof result === 'string' ? result : 'Failed';
      console.log(chalk.red(`✗ ${healthCheck.name}: ${message}`));
      if (healthCheck.required) {
        failedRequired++;
      } else {
        failedOptional++;
      }
    }
  }

  // Summary
  console.log(chalk.bold('\n📊 Summary:'));
  console.log(`  Required: ${passedRequired}/${passedRequired + failedRequired} passed`);
  console.log(`  Optional: ${passedOptional}/${passedOptional + failedOptional} passed`);

  if (failedRequired > 0) {
    console.log(chalk.bold.red('\n❌ Health check failed - required checks did not pass'));
    process.exit(1);
  } else if (failedOptional > 0) {
    console.log(chalk.bold.yellow('\n⚠️  Health check passed with warnings'));
    process.exit(0);
  } else {
    console.log(chalk.bold.green('\n✅ All health checks passed!'));
    process.exit(0);
  }
}

// Run health checks
runHealthChecks().catch((error) => {
  console.error(chalk.red(`\nHealth check script failed: ${error.message}`));
  process.exit(1);
});
