# Quick Start Guide

Get started with Agentic Brand Builder in 5 minutes.

## ⚠️ Important Note

**Current Status**: Early Beta - Only **7.5% complete** (3 of 40 agents)

This system currently returns **placeholder data** for most operations. See [AUDIT_REPORT.md](./AUDIT_REPORT.md) for details.

---

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Install

```bash
# Clone the repository
git clone https://github.com/yourusername/agentic-brand-builder.git
cd agentic-brand-builder

# Install dependencies
npm install

# Set up environment
cp .env.example .env
```

Edit `.env` and add your API key:
```
ANTHROPIC_API_KEY=your_api_key_here
```

### Verify Installation

```bash
# Run health check
npm run health-check

# Should show:
# ✓ Environment Variables
# ✓ TypeScript Compilation
# ✓ Linting
# ✓ Required Directories
# ✓ Example Brand Context
```

---

## 🚀 Quick Usage

### 1. Validate a Brand Context

```bash
npm run dev -- validate examples/brand-context-example.json
```

**Output:**
```
✓ Validating brand context...

✅ Brand context is valid!

Brand Details:
  Name: Flyberry Gourmet
  Category: Gourmet Food & Snacks
  Competitors: 4
  Data Sources: 4
```

✅ **This works!** - Validation is fully functional

### 2. Run Orchestration (Demo Mode)

```bash
npm run orchestrate -- --brand examples/brand-context-example.json
```

**Output:**
```
🚀 Agentic Brand Builder

⚠️  EARLY BETA - 7.5% Complete (3 of 40 agents implemented)
   Most agents return placeholder data. See AUDIT_REPORT.md for details.

Brand: Flyberry Gourmet
Category: Gourmet Food & Snacks
Stages: 6

📍 Stage 1: Data Ingestion & Extraction
  Agents: 8
  ✓ Competitor Research
  ✓ PDF Extraction (placeholder)
  ...

✅ Quality gate passed (7.5/10)

[Continues through all 6 stages...]

✅ Orchestration completed in 30.45s
```

⚠️ **Note**: This runs but produces placeholder data for most agents

---

## 📝 Create Your Brand Context

### Minimal Example

```json
{
  "brandName": "My Brand",
  "category": "My Category"
}
```

### Complete Example

```json
{
  "brandName": "My Awesome Brand",
  "category": "Premium Food & Beverage",
  "currentRevenue": "₹10 Cr",
  "targetRevenue": "₹50 Cr",
  "website": "https://mybrand.com",
  "competitors": [
    "Competitor A",
    "Competitor B"
  ],
  "dataSources": [
    {
      "type": "pdf",
      "path": "./data/investor-report.pdf",
      "description": "Q1 2025 Investor Report"
    },
    {
      "type": "website",
      "path": "https://mybrand.com",
      "description": "Main Website"
    }
  ],
  "customInstructions": "Focus on premium positioning in urban markets"
}
```

Save as `my-brand-context.json` and run:

```bash
npm run dev -- validate my-brand-context.json
npm run orchestrate -- --brand my-brand-context.json
```

---

## 🧪 Run Tests

```bash
# Run all tests (22 tests)
npm test

# Run in watch mode
npm run test:watch

# Run specific test
npm test base-agent
```

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Run with tsx
npm run build            # Build to dist/
npm run type-check       # TypeScript validation
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix lint issues

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode

# Health & Validation
npm run health-check     # System health check
npm run orchestrate      # Run pipeline
```

---

## 📊 What Actually Works?

### ✅ Fully Functional
- Brand context validation (Zod schemas)
- CLI interface and commands
- Quality gate framework
- 6-stage orchestration pipeline
- Error handling and retry logic
- 3 real agents:
  - Competitor Research
  - Review Analysis
  - Positioning Strategy

### ⚠️ Partially Functional
- Orchestration runs but most agents are placeholders
- No actual document generation
- No HTML/PDF output

### ❌ Not Yet Implemented
- 37 of 40 agents (92.5%)
- Document generation system
- HTML/PDF output generation
- Visual identity auditing
- Financial modeling

---

## 📖 Next Steps

### Learn More
- Read [README.md](./README.md) for detailed information
- Review [AUDIT_REPORT.md](./AUDIT_REPORT.md) for comprehensive analysis
- Check [ROADMAP.md](./ROADMAP.md) for implementation timeline

### Contribute
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines
- Pick an agent from [ROADMAP.md](./ROADMAP.md)
- Help us reach 100% completion!

### Get Help
- [GitHub Issues](https://github.com/yourusername/agentic-brand-builder/issues) for bugs
- [GitHub Discussions](https://github.com/yourusername/agentic-brand-builder/discussions) for questions
- Check [docs/](./docs/) for more documentation

---

## 🐛 Troubleshooting

### API Key Not Found
```
❌ ANTHROPIC_API_KEY not found in environment variables
```

**Solution**: Add your API key to `.env` file

### Module Not Found
```
Error: Cannot find module '@anthropic-ai/sdk'
```

**Solution**: Run `npm install`

### Type Errors
```
error TS2345: Argument of type 'string' is not assignable...
```

**Solution**: Run `npm run build` to see full error details

### Tests Failing
```
 FAIL  tests/agents/base-agent.test.ts
```

**Solution**:
1. Ensure dependencies installed: `npm install`
2. Check Node version: `node --version` (must be >= 18)
3. Run `npm run type-check` to find type issues

---

## 📊 Project Status Summary

| Aspect | Status |
|--------|--------|
| **Architecture** | ✅ Complete (9/10) |
| **Core Pipeline** | ✅ Complete (100%) |
| **Agent Framework** | ✅ Complete (100%) |
| **Agents Implemented** | 🔴 3 of 40 (7.5%) |
| **Testing** | 🟡 22 tests (40% coverage) |
| **Documentation** | ✅ Comprehensive |
| **Production Ready** | 🔴 No (needs 6-12 months) |

---

## ⏱️ Expected Timelines

### What's Possible Now
- ✅ **5 minutes**: Validate brand context
- ✅ **5 minutes**: Run demo orchestration
- ✅ **10 minutes**: Create your brand context
- ✅ **30 minutes**: Understand architecture

### What Takes Time
- ⏳ **2-4 days per agent**: Implement new agent
- ⏳ **2-3 months**: MVP (10 agents, basic output)
- ⏳ **6-12 months**: Full system (40 agents, complete)

---

## 🎯 Your Goals

**If you want to...**

### Test the system
✅ **Start here** - This quick start guide
- Validate your brand context
- Run demo orchestration
- Understand what works

### Contribute
➡️ **Next**: Read [CONTRIBUTING.md](./CONTRIBUTING.md)
- Pick an agent to implement
- Follow implementation checklist
- Submit PR

### Use in production
⚠️ **Not ready yet** - See [ROADMAP.md](./ROADMAP.md)
- Current status: 7.5% complete
- Timeline: 6-12 months to production
- Consider MVP path (2-3 months)

---

## 🎉 Success!

If you've made it here, you now know:
- ✅ How to install and setup
- ✅ How to validate brand context
- ✅ How to run orchestration
- ✅ What works vs what doesn't
- ✅ Where to go next

**Questions?** Check [README.md](./README.md) or open a [GitHub Discussion](https://github.com/yourusername/agentic-brand-builder/discussions)

**Ready to contribute?** See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Quick Start Guide** | Version 1.0 | Updated: October 16, 2025
