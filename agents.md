# Agentic Brand Builder - Codex Agent Guide

> AI-powered brand intelligence system with 6-stage multi-agent orchestration for comprehensive brand strategy documents

## Repository Overview

This is a multi-agent orchestration system that generates comprehensive brand strategy documents through 6 sequential stages of analysis.

**Purpose**: Automated brand intelligence and strategy generation using AI agents

**Tech Stack**: TypeScript, Node.js 18+, Claude AI (Sonnet 4.5), Puppeteer, PDF parsing

## Project Context

### What This Tool Does

1. **Multi-stage analysis** - 6 sequential agent stages
2. **Web scraping** - Automated website content extraction
3. **Competitive analysis** - Competitor research and comparison
4. **Market insights** - Industry trends and positioning
5. **Strategy generation** - Comprehensive brand strategy documents
6. **Document output** - Markdown, JSON, HTML formats

### The 6-Stage Pipeline

1. **Stage 1: Discovery** - Brand website analysis, content extraction
2. **Stage 2: Competitive Intelligence** - Competitor research and analysis
3. **Stage 3: Market Research** - Industry trends, consumer insights
4. **Stage 4: Strategic Analysis** - SWOT, positioning, differentiation
5. **Stage 5: Synthesis** - Integration of all findings
6. **Stage 6: Strategy Generation** - Final comprehensive strategy document

## Architecture

### Entry Points

- **`src/index.ts`** - Main orchestrator
- **`src/cli.ts`** - Command-line interface

### Key Directories

```
src/
├── agents/           # 6 stage agents
├── orchestrator/     # Multi-agent coordination
├── scrapers/         # Web scraping utilities
├── parsers/          # PDF, HTML content parsers
├── generators/       # Document generators
└── utils/           # Shared utilities
```

### Critical Files

- `src/index.ts` - Main orchestrator entry
- `src/orchestrator/pipeline.ts` - Stage coordination
- `src/agents/discovery-agent.ts` - Stage 1 agent
- `src/generators/strategy-generator.ts` - Final output

## Code Standards

### TypeScript Conventions

- **Strict mode**: Always enabled
- **No `any` types**: Use `unknown` or proper types
- **camelCase**: For variables/functions
- **Async/await**: For all I/O operations
- **Error context**: All errors must explain what failed

### File Size Limits

- **Files**: <500 lines (excellent), <700 (acceptable), >900 (MUST split)
- **Functions**: <100 lines (excellent), <150 (acceptable), >200 (MUST refactor)

### Error Handling

```typescript
// Good
throw new Error(
  `Stage ${stageNumber} failed for brand "${brandName}": ` +
  `${error.message}. Check API key and network connection.`
);
```

## Common Patterns

### Agent Pattern

Each stage agent follows this structure:

```typescript
export class DiscoveryAgent {
  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      // Scrape brand website
      const content = await this.scrapeWebsite(context.brandUrl);

      // Analyze content with Claude
      const analysis = await this.analyzeContent(content);

      // Return structured result
      return {
        stage: 1,
        status: 'success',
        data: analysis,
        metadata: {
          timestamp: new Date(),
          tokensUsed: analysis.usage.total_tokens,
        },
      };
    } catch (error) {
      return {
        stage: 1,
        status: 'error',
        error: error.message,
      };
    }
  }
}
```

### Orchestrator Pattern

```typescript
export class Pipeline {
  async run(brand: string): Promise<StrategyDocument> {
    const results = [];

    // Execute stages sequentially
    for (const agent of this.agents) {
      const result = await agent.execute({
        brand,
        previousResults: results,
      });

      if (result.status === 'error') {
        throw new Error(`Pipeline failed at stage ${result.stage}`);
      }

      results.push(result);
    }

    // Generate final strategy
    return this.generateStrategy(results);
  }
}
```

## Testing

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run type-check     # TypeScript type checking
npm run lint           # ESLint
```

### Quality Gates

Before committing:

```bash
npm run type-check  # MUST pass
npm run lint       # MUST pass
npm test           # For significant changes
npm run build      # Ensure build succeeds
```

## Common Tasks

### Running the Pipeline

```bash
# Development mode
npm run dev -- orchestrate --brand "Example Brand"

# Analyze existing strategy
npm run dev -- analyze --input strategy.json

# Custom brand URL
npm run dev -- orchestrate --brand "Example" --url https://example.com
```

### Output Locations

Generated strategies are saved to:
- `./outputs/strategies/<brand-name>-strategy.json`
- `./outputs/strategies/<brand-name>-strategy.md`

## Environment Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Environment Variables

Create `.env` file:

```bash
# Required
ANTHROPIC_API_KEY=your_key_here

# Optional
NODE_ENV=development
LOG_LEVEL=info
```

### First Time Setup

```bash
npm install
npm run build
npm run dev -- orchestrate --brand "Test Brand"
```

## Focus Areas for Code Review

### High Priority

1. **Agent coordination** - Ensure stages execute in correct order
2. **Error handling** - Graceful failure with context
3. **Type safety** - No `any` types
4. **API usage** - Efficient token usage, rate limiting

### Medium Priority

5. **Data flow** - Clean passing of context between stages
6. **Test coverage** - Ensure agents have unit tests
7. **Documentation** - JSDoc for agent APIs
8. **Performance** - Optimize web scraping and API calls

### Watch For

- ❌ Stages executing out of order
- ❌ Unhandled promise rejections
- ❌ Missing error context
- ❌ Hardcoded brand names or URLs
- ❌ API keys in code

## Common Issues

### Stage Failures

**Problem**: Agent fails mid-pipeline
**Solution**: Implement checkpoint/resume logic

```typescript
async run(brand: string): Promise<StrategyDocument> {
  const checkpoint = await this.loadCheckpoint(brand);

  for (let i = checkpoint.lastStage + 1; i < this.agents.length; i++) {
    const result = await this.agents[i].execute(context);
    await this.saveCheckpoint(brand, i, result);
  }
}
```

### Web Scraping Timeouts

**Problem**: Some websites are slow to load
**Solution**: Implement retry with backoff

```typescript
async scrapeWithRetry(url: string, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await this.scrape(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
```

## Dependencies

### Key Dependencies

- `@anthropic-ai/sdk` - Claude AI for analysis
- `puppeteer` - Web scraping
- `pdf-parse` - PDF document parsing
- `cheerio` - HTML parsing
- `commander` - CLI framework
- `chalk` - Terminal colors
- `ora` - Loading spinners
- `marked` - Markdown processing
- `zod` - Schema validation

### Dev Dependencies

- `typescript` - TypeScript compiler
- `vitest` - Testing framework
- `eslint` - Linting
- `tsx` - TypeScript execution

## Git Workflow

### Commit Conventions

Use standard types with stage context:
- `feat(stage1)` - Stage 1 features
- `feat(stage2)` - Stage 2 features
- `fix(orchestrator)` - Orchestrator fixes
- `refactor(agents)` - Agent refactoring

Examples:
```
feat(stage1): add PDF document parsing
fix(orchestrator): handle stage failures gracefully
refactor(agents): extract common scraping logic
```

## Known Challenges

### Token Usage

**Challenge**: Claude API has token limits per request
**Solution**:
- Chunk large content before sending to API
- Use streaming for long responses
- Cache intermediate results

### Rate Limiting

**Challenge**: API rate limits for high-volume usage
**Solution**:
- Implement exponential backoff
- Queue requests
- Cache results where possible

### Web Scraping Reliability

**Challenge**: Websites may block automated scraping
**Solution**:
- Use stealth mode in Puppeteer
- Implement user-agent rotation
- Add delays between requests

## Project Status

- **Current Version**: 1.0.0
- **Production Ready**: Yes (core pipeline stable)
- **Test Coverage**: In progress
- **Maintained By**: Kalpesh + Claude Code

## When Reviewing Pull Requests

### Check For

- ✅ Type-check passes (`npm run type-check`)
- ✅ Linting passes (`npm run lint`)
- ✅ Tests pass (`npm test`)
- ✅ Build succeeds (`npm run build`)
- ✅ Files <500 lines
- ✅ Functions <100 lines
- ✅ Error messages have context
- ✅ No hardcoded secrets
- ✅ Proper stage sequencing

### Agent-Specific Checks

- ✅ Agent returns proper `AgentResult` structure
- ✅ Stage number is correct
- ✅ Context properly passed to next stage
- ✅ Errors are caught and handled
- ✅ Token usage is tracked

## Questions or Issues?

- Check `README.md` for setup instructions
- Review existing agents for patterns
- Ask for clarification if requirements unclear

---

**Last Updated**: 2025-10-16
**Maintained By**: Kalpesh Jaju
**Project**: Agentic Brand Builder
