#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import chalk from 'chalk';
import { MasterOrchestrator } from './orchestrator/master-orchestrator.js';
import { BrandContextSchema, Stage } from './types/index.js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
config();

const program = new Command();

program
  .name('agentic-brand-builder')
  .description('AI-powered brand intelligence system with 6-stage multi-agent orchestration')
  .version('1.0.0');

/**
 * Orchestrate command - Run full brand intelligence pipeline
 */
program
  .command('orchestrate')
  .description('Run the complete 6-stage orchestration pipeline')
  .option('-b, --brand <file>', 'Path to brand context JSON file')
  .option('-o, --output <dir>', 'Output directory', './outputs')
  .option('-s, --stages <stages>', 'Comma-separated list of stages to run (default: all)', 'all')
  .option('-p, --parallel <number>', 'Number of parallel agents', '5')
  .action(async (options) => {
    try {
      console.log(chalk.bold.blue('\n🚀 Agentic Brand Builder\n'));

      // Validate API key
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.log(chalk.red('❌ ANTHROPIC_API_KEY not found in environment variables'));
        console.log(chalk.yellow('Please set your API key in .env file or environment'));
        process.exit(1);
      }

      // Load brand context
      if (!options.brand) {
        console.log(chalk.red('❌ Brand context file required'));
        console.log(chalk.yellow('Usage: npm run orchestrate -- --brand path/to/brand.json'));
        process.exit(1);
      }

      const brandPath = resolve(options.brand);
      if (!existsSync(brandPath)) {
        console.log(chalk.red(`❌ Brand context file not found: ${brandPath}`));
        process.exit(1);
      }

      const brandData = JSON.parse(readFileSync(brandPath, 'utf-8'));
      const brandContext = BrandContextSchema.parse(brandData);

      // Parse stages
      const allStages: Stage[] = [
        Stage.DATA_INGESTION,
        Stage.ANALYSIS,
        Stage.INTELLIGENCE,
        Stage.STRATEGY,
        Stage.VALIDATION,
        Stage.PRODUCTION
      ];

      const stages = options.stages === 'all'
        ? allStages
        : options.stages.split(',').map((s: string) => s.trim() as Stage);

      // Create orchestration config
      const orchestrationConfig = {
        brandContext,
        stages,
        parallelAgents: parseInt(options.parallel),
        outputFormats: ['html', 'markdown'] as ('html' | 'pdf' | 'markdown')[],
        outputDir: options.output
      };

      // Run orchestration
      const orchestrator = new MasterOrchestrator(orchestrationConfig, apiKey);
      const result = await orchestrator.orchestrate();

      // Display results
      console.log(chalk.bold.green('\n✅ Orchestration Complete!\n'));
      console.log(chalk.gray('Results:'));
      console.log(chalk.gray(`  Brand: ${result.brandContext.brandName}`));
      console.log(chalk.gray(`  Status: ${result.overallStatus}`));
      console.log(chalk.gray(`  Duration: ${(result.totalDurationMs / 1000).toFixed(2)}s`));
      console.log(chalk.gray(`  Stages completed: ${result.stageResults.length}`));

      if (result.overallStatus === 'failed') {
        process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red(`\n❌ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

/**
 * Create brand command - Initialize a new brand context file
 */
program
  .command('create-brand')
  .description('Create a new brand context file interactively')
  .option('-o, --output <file>', 'Output file path', './brand-context.json')
  .action(async (_options) => {
    console.log(chalk.bold.blue('\n📝 Create Brand Context\n'));
    console.log(chalk.yellow('Interactive brand context creator coming soon...'));
    console.log(chalk.gray('\nFor now, create a JSON file with this structure:'));
    console.log(chalk.gray(`
{
  "brandName": "Your Brand Name",
  "category": "Brand Category",
  "currentRevenue": "₹35 Cr",
  "targetRevenue": "₹100 Cr",
  "website": "https://yourbrand.com",
  "competitors": ["Competitor 1", "Competitor 2"],
  "dataSources": [
    {
      "type": "pdf",
      "path": "./data/investor-report.pdf",
      "description": "Q1 2025 Investor Report"
    }
  ],
  "customInstructions": "Any specific instructions..."
}
    `));
  });

/**
 * Validate command - Validate a brand context file
 */
program
  .command('validate')
  .description('Validate a brand context JSON file')
  .argument('<file>', 'Path to brand context JSON file')
  .action((file) => {
    try {
      console.log(chalk.bold.blue('\n✓ Validating brand context...\n'));

      const filePath = resolve(file);
      if (!existsSync(filePath)) {
        console.log(chalk.red(`❌ File not found: ${filePath}`));
        process.exit(1);
      }

      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      const brandContext = BrandContextSchema.parse(data);

      console.log(chalk.green('✅ Brand context is valid!\n'));
      console.log(chalk.gray('Brand Details:'));
      console.log(chalk.gray(`  Name: ${brandContext.brandName}`));
      console.log(chalk.gray(`  Category: ${brandContext.category}`));
      console.log(chalk.gray(`  Competitors: ${brandContext.competitors.length}`));
      console.log(chalk.gray(`  Data Sources: ${brandContext.dataSources.length}`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Validation failed: ${(error as Error).message}`));
      process.exit(1);
    }
  });

program.parse();
