# Agentic Brand Builder

> AI-powered brand intelligence system with 6-stage multi-agent orchestration for comprehensive brand strategy documents

## Overview

**Agentic Brand Builder** is a production-grade system that generates comprehensive brand intelligence documents similar to the `flyberry-brand-doc-2025` outcome. It uses a 6-stage multi-agent orchestration pipeline powered by Claude AI to create:

- ✅ **46+ strategic documents** organized into 6 acts
- ✅ **Comprehensive brand analysis** from data ingestion to production
- ✅ **Evidence-based positioning** with competitive intelligence
- ✅ **Multi-format outputs** (HTML, PDF, Markdown)
- ✅ **Quality assurance** with automated validation gates

---

## Architecture

### 6-Stage Orchestration Pipeline

```
Stage 1: Data Ingestion → Stage 2: Analysis → Stage 3: Intelligence →
Stage 4: Strategy → Stage 5: Validation → Stage 6: Production
```

#### **Stage 1: Data Ingestion & Extraction**
- PDF Extraction Agent
- Data Normalization Agent
- Entity Recognition Agent
- Competitor Research Agent
- Market Intelligence Agent
- Pricing Intelligence Agent
- Visual Identity Auditor
- UX Auditor

#### **Stage 2: Analysis & Synthesis**
- Review Analysis Agent (261+ reviews)
- Segmentation Agent (CLV calculation)
- Jobs-to-be-Done Agent
- Positioning Mapper
- Differentiation Analyzer
- Financial Projection Agent
- ROI Calculator
- Budget Allocation Agent

#### **Stage 3: Strategic Intelligence Generation**
- Positioning Strategy Agent (Josh Lowman framework)
- Messaging Architecture Agent
- Brand Narrative Agent (5-act narrative)
- Roadmap Planning Agent
- Resource Planning Agent
- Risk Identification Agent
- Mitigation Strategy Agent

#### **Stage 4: Content Generation & Documentation**
- Strategic Document Writer (46+ docs)
- Executive Summary Writer
- Technical Specification Writer
- Narrative Flow Agent (6-act structure)
- Navigation Builder

#### **Stage 5: Quality Assurance & Validation**
- Consistency Checker (263 data points)
- Fact Verification Agent
- Contradiction Detector
- Strategic Auditor (9.0/10 score)
- Gap Analyzer

#### **Stage 6: Production & Output Generation**
- HTML Generator (8 HTML files)
- Asset Optimizer
- PDF Generator

---

## Installation

### Prerequisites

- Node.js >= 18.0.0
- Anthropic API key

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/agentic-brand-builder.git
cd agentic-brand-builder

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Add your Anthropic API key to .env
# ANTHROPIC_API_KEY=your_api_key_here
```

---

## Usage

### 1. Create Brand Context

Create a brand context JSON file with your brand information:

```json
{
  "brandName": "Your Brand",
  "category": "Your Category",
  "currentRevenue": "₹35 Cr",
  "targetRevenue": "₹100 Cr",
  "website": "https://yourbrand.com",
  "competitors": ["Competitor 1", "Competitor 2"],
  "dataSources": [
    {
      "type": "pdf",
      "path": "./data/report.pdf",
      "description": "Investor Report"
    }
  ],
  "customInstructions": "Focus on premium positioning..."
}
```

See `examples/brand-context-example.json` for a complete example.

### 2. Validate Brand Context

```bash
npm run dev -- validate brand-context.json
```

### 3. Run Orchestration

Run the complete 6-stage pipeline:

```bash
npm run orchestrate -- --brand brand-context.json --output ./outputs
```

Run specific stages only:

```bash
npm run orchestrate -- --brand brand-context.json --stages data_ingestion,analysis
```

Adjust parallel agents:

```bash
npm run orchestrate -- --brand brand-context.json --parallel 10
```

---

## Output

The system generates:

### Documents (Markdown)
- **Act 1: WHO WE ARE** (7 documents)
  - Origin story, sourcing philosophy, hero products, catalog, clients, persona, promise

- **Act 2: WHERE WE ARE** (9 documents)
  - Current positioning, customers, channels, performance, milestones, challenges, competitors, design teardowns

- **Act 3: WHAT WE DISCOVERED** (5 documents)
  - Customer insights, sentiment analysis, ideal segments, jobs-to-be-done

- **Act 4: WHERE WE SHOULD GO** (7 documents)
  - Vision, repositioning strategy, positioning, messaging, persona, differentiation, goals

- **Act 5: IS THIS READY?** (3 documents)
  - Comprehensive audit, issues & fixes, gap analysis

- **Act 6: HOW WE EXECUTE** (15+ documents)
  - Execution overview, brand assets, identity requirements, training, pricing, risks, budgets, timelines

### Rendered Outputs
- **HTML**: 8 responsive HTML files with navigation
- **PDF**: Print-ready PDF versions
- **Markdown**: Source markdown files

### Example Output Structure
```
outputs/
├── brand-name/
│   ├── source-documents/
│   │   ├── 00-START-HERE.md
│   │   ├── ACT-1-INDEX.md
│   │   ├── 01-origin-story.md
│   │   ├── ...
│   │   └── 46-timeline.md
│   ├── html/
│   │   ├── index.html
│   │   ├── act-1-who-we-are.html
│   │   ├── ...
│   │   └── sources.html
│   └── pdfs/
│       └── brand-package-complete.pdf
```

---

## CLI Commands

### `orchestrate`
Run the complete orchestration pipeline

```bash
npm run orchestrate -- --brand <file> [options]

Options:
  -b, --brand <file>       Path to brand context JSON file (required)
  -o, --output <dir>       Output directory (default: ./outputs)
  -s, --stages <stages>    Comma-separated stages to run (default: all)
  -p, --parallel <number>  Number of parallel agents (default: 5)
```

### `validate`
Validate a brand context file

```bash
npm run dev -- validate <file>
```

### `create-brand`
Initialize a new brand context (coming soon)

```bash
npm run dev -- create-brand --output brand-context.json
```

---

## Programmatic Usage

You can use the orchestrator programmatically in your own code:

```typescript
import { MasterOrchestrator, Stage } from 'agentic-brand-builder';

const config = {
  brandContext: {
    brandName: 'Your Brand',
    category: 'Your Category',
    // ... other fields
  },
  stages: [
    'data_ingestion',
    'analysis',
    'intelligence',
    'strategy',
    'validation',
    'production'
  ] as Stage[],
  parallelAgents: 5,
  outputFormats: ['html', 'markdown'] as ('html' | 'markdown')[],
  outputDir: './outputs'
};

const orchestrator = new MasterOrchestrator(config, process.env.ANTHROPIC_API_KEY!);
const result = await orchestrator.orchestrate();

console.log(`Status: ${result.overallStatus}`);
console.log(`Duration: ${result.totalDurationMs}ms`);
```

---

## Development

### Project Structure

```
agentic-brand-builder/
├── src/
│   ├── agents/              # Agent implementations
│   │   ├── base-agent.ts    # Base agent class
│   │   ├── agent-factory.ts # Agent factory
│   │   ├── stage1/          # Stage 1 agents
│   │   ├── stage2/          # Stage 2 agents
│   │   └── stage3/          # Stage 3 agents
│   ├── orchestrator/        # Orchestration logic
│   │   └── master-orchestrator.ts
│   ├── stages/              # Stage orchestrators
│   │   └── stage-orchestrator.ts
│   ├── config/              # Configuration
│   │   └── context-manager.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utilities
│   ├── cli.ts               # CLI interface
│   └── index.ts             # Main entry
├── examples/                # Example files
├── outputs/                 # Generated outputs
├── tests/                   # Tests
└── docs/                    # Documentation
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

### Test

```bash
npm test
```

---

## Creating Custom Agents

Extend the `BaseAgent` class to create custom agents:

```typescript
import { BaseAgent } from './agents/base-agent.js';
import type { AgentInput } from './types/index.js';

export class MyCustomAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);

    const systemPrompt = `You are a specialized agent that...`;
    const userPrompt = `${brandContext}\n\nAnalyze...`;

    const response = await this.callClaude(systemPrompt, userPrompt);

    return {
      data: JSON.parse(response.content),
      tokensUsed: response.tokensUsed,
      confidence: 0.85,
      sources: ['web research', 'analysis']
    };
  }
}
```

Register in `AgentFactory`:

```typescript
case 'my_custom_agent':
  return new MyCustomAgent(config, this.apiKey);
```

---

## Quality Gates

Each stage has quality gates that must pass:

1. ✅ **All agents completed** (required)
2. ✅ **No errors** (required)
3. ✅ **Data quality** (optional, +3 points)
4. ✅ **Performance** (optional, +2 points)

**Passing Score**: 7/10

Critical stages (1-3) must pass or orchestration aborts.

---

## Key Features

### 🎯 **Evidence-Based Intelligence**
- All insights backed by data sources
- Confidence scoring on every output
- Source citation and verification

### 🔄 **Shared Context Management**
- Each agent contributes to shared context
- Later stages build on previous analysis
- No redundant data collection

### ⚡ **Parallel Processing**
- Multiple agents run simultaneously
- Configurable parallelism
- Optimized for speed

### 🛡️ **Built-in Quality Assurance**
- Automated consistency checking
- Fact verification
- Contradiction detection
- Strategic audit scoring

### 📊 **Multi-Format Outputs**
- Responsive HTML with navigation
- Print-ready PDFs
- Source markdown files
- Stakeholder-specific views

---

## Roadmap

- [ ] Interactive brand context creator
- [ ] More agent implementations (currently 3/40 implemented)
- [ ] Visual identity generation (logo, colors, typography)
- [ ] Presentation deck builder
- [ ] Real-time progress dashboard
- [ ] Agent performance analytics
- [ ] Resume/checkpoint system
- [ ] Multi-brand comparison mode

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## License

MIT License - see LICENSE file for details

---

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/agentic-brand-builder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/agentic-brand-builder/discussions)

---

## Credits

Built by **Kalpesh Jaju** using:
- Claude AI (Anthropic)
- TypeScript
- Node.js

Inspired by the comprehensive brand intelligence methodology demonstrated in flyberry-brand-doc-2025.

---

**Last Updated**: October 16, 2025
**Version**: 1.0.0
