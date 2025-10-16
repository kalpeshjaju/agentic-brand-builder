# Contributing to Agentic Brand Builder

Thank you for your interest in contributing! This project needs significant help implementing 37 remaining agents (currently 7.5% complete).

## 🎯 How You Can Help

### High Priority Contributions Needed

1. **Agent Implementations** (37 agents remaining)
   - See [ROADMAP.md](./ROADMAP.md) for priority list
   - Each agent takes 2-4 days to implement + test

2. **Testing** (expand from 40% to 70%+)
   - Unit tests for new agents
   - Integration tests
   - End-to-end workflow tests

3. **Documentation**
   - Agent implementation guides
   - API documentation
   - Usage examples

4. **Bug Fixes**
   - See [GitHub Issues](https://github.com/yourusername/agentic-brand-builder/issues)

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Git
- Anthropic API key (for testing)
- TypeScript knowledge

### Setup Development Environment

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/agentic-brand-builder.git
cd agentic-brand-builder

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run tests to verify setup
npm test

# Run type-check and lint
npm run type-check
npm run lint

# Build the project
npm run build
```

## 📝 Contributing Workflow

### 1. Pick an Issue or Agent

**Option A: Pick from Roadmap**
- See [ROADMAP.md](./ROADMAP.md) for priority agents
- Comment on the issue saying you're working on it

**Option B: Pick an Open Issue**
- Browse [GitHub Issues](https://github.com/yourusername/agentic-brand-builder/issues)
- Look for `good first issue` or `help wanted` labels
- Comment to claim the issue

**Option C: Find a Bug**
- Test the system
- Report bugs with detailed reproduction steps
- Bonus: Submit a PR with the fix!

### 2. Create a Branch

```bash
# Create feature branch
git checkout -b feature/pdf-extraction-agent

# Or for bug fixes
git checkout -b fix/issue-123
```

Branch naming:
- `feature/agent-name` for new agents
- `feature/description` for new features
- `fix/issue-number` for bug fixes
- `test/description` for test additions
- `docs/description` for documentation

### 3. Implement Your Changes

#### For New Agents

Follow the **Agent Implementation Checklist**:

```typescript
// 1. Create agent file: src/agents/stage1/pdf-extraction-agent.ts

import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

export class PdfExtractionAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);

    const systemPrompt = 'You are a PDF extraction specialist...';
    const userPrompt = `${brandContext}\n\nExtract data from...`;

    const response = await this.callClaude(systemPrompt, userPrompt);

    // Parse and validate response
    const data = JSON.parse(response.content);

    return {
      data,
      tokensUsed: response.tokensUsed,
      confidence: 0.85,
      sources: ['pdf_extraction']
    };
  }
}
```

```typescript
// 2. Register in src/agents/agent-factory.ts

import { PdfExtractionAgent } from './stage1/pdf-extraction-agent.js';

// In createAgent() switch statement:
case AgentType.PDF_EXTRACTION:
  return new PdfExtractionAgent(config, this.apiKey);
```

```typescript
// 3. Create tests: tests/agents/pdf-extraction-agent.test.ts

import { describe, it, expect } from 'vitest';
import { PdfExtractionAgent } from '../../src/agents/stage1/pdf-extraction-agent.js';

describe('PdfExtractionAgent', () => {
  it('should extract data from PDF', async () => {
    // Test implementation
  });
});
```

### 4. Write Tests

**Required:**
- ✅ Unit tests for your agent (min 5 tests)
- ✅ All tests passing (`npm test`)
- ✅ Integration test if applicable

**Test Coverage Goals:**
- New code: 80%+ coverage
- Critical paths: 100% coverage
- Error cases: Fully covered

### 5. Quality Checks

Before committing, ensure all checks pass:

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Tests
npm test

# Build
npm run build
```

**All must pass ✅ or your PR will be rejected.**

### 6. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: implement PDF Extraction Agent

- Add PdfExtractionAgent class
- Register in AgentFactory
- Add 8 unit tests (all passing)
- Update documentation

Closes #42"
```

**Commit Types:**
- `feat:` New feature (new agent, capability)
- `fix:` Bug fix
- `test:` Add tests
- `docs:` Documentation only
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

### 7. Push and Create PR

```bash
# Push to your fork
git push origin feature/pdf-extraction-agent

# Create PR on GitHub
# Use the PR template (will auto-populate)
```

## 📋 Pull Request Guidelines

### PR Title Format

```
feat: implement PDF Extraction Agent
fix: correct retry logic in BaseAgent
test: add integration tests for Stage 1
docs: update agent implementation guide
```

### PR Description Template

```markdown
## What Changed
Brief description of changes

## Why
Why these changes were needed

## How to Test
1. Step-by-step testing instructions
2. Expected results

## Checklist
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Documentation updated
- [ ] ROADMAP.md updated (if agent implemented)

## Related Issues
Closes #42
```

### PR Review Process

1. **Automated Checks** (must pass)
   - Type-check
   - Lint
   - Tests
   - Build

2. **Code Review** (1 approval required)
   - Code quality
   - Test coverage
   - Documentation
   - Follows patterns

3. **Merge**
   - Squash and merge to main
   - Delete feature branch

## 🎨 Code Style Guidelines

### TypeScript

```typescript
// ✅ Good
export class PdfExtractionAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<AgentOutput> {
    // Implementation
  }
}

// ❌ Bad
export class PdfExtractionAgent extends BaseAgent {
  protected async run(input: any): Promise<any> {  // No 'any' types
    // Implementation
  }
}
```

### File Size Limits

- **Files**: <500 lines (excellent), <600 (acceptable), >800 (must split)
- **Functions**: <75 lines (excellent), <120 (acceptable), >150 (must refactor)

### Error Messages

```typescript
// ✅ Good - Contextual, actionable
throw new Error(
  `Failed to extract PDF at ${pdfPath}. ` +
  `Ensure file exists and is readable. ` +
  `Error: ${error.message}`
);

// ❌ Bad - Generic, unhelpful
throw new Error('Failed');
```

### Type Safety

```typescript
// ✅ Good
const data: unknown = JSON.parse(response);
const typedData = data as { name: string };

// ❌ Bad
const data: any = JSON.parse(response);  // No 'any'
```

## 🧪 Testing Guidelines

### Test Structure

```typescript
describe('AgentName', () => {
  describe('methodName', () => {
    it('should do something specific', async () => {
      // Arrange
      const input = createMockInput();
      const agent = new AgentName(config, apiKey);

      // Act
      const result = await agent.execute(input);

      // Assert
      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });
  });
});
```

### Mock External Dependencies

```typescript
// ✅ Good - Mock API calls
vi.mock('@anthropic-ai/sdk', () => ({
  Anthropic: vi.fn()
}));

// ❌ Bad - Real API calls in tests
const result = await agent.execute(input); // Hits real API
```

## 📚 Documentation Guidelines

### Code Comments

```typescript
/**
 * Extract structured data from PDF documents
 *
 * @param input - Brand context and PDF paths
 * @returns Extracted data with confidence score
 * @throws Error if PDF cannot be read or parsed
 */
protected async run(input: AgentInput): Promise<AgentOutput> {
  // Implementation
}
```

### README Updates

When adding agents:
1. Update agent count in README.md
2. Mark agent as ✅ in architecture section
3. Update implementation percentage
4. Update ROADMAP.md progress

## 🐛 Bug Reports

### Good Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: macOS 14.1
- Node: 18.17.0
- Version: 1.0.0-beta

**Logs/Screenshots**
Paste relevant logs or add screenshots
```

## 🎯 Agent Implementation Priority

See [ROADMAP.md](./ROADMAP.md) for full priority list.

**Week 1-2 (Highest Priority):**
1. PDF Extraction Agent
2. Data Normalization Agent

**Week 3-4:**
3. Segmentation Agent
4. Jobs-to-be-Done Agent

**Week 5-6:**
5. Messaging Architecture Agent

**Week 7:**
6. Document Writer Agent
7. HTML Generator Agent

## 💬 Communication

### Questions?

- **General questions**: [GitHub Discussions](https://github.com/yourusername/agentic-brand-builder/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/yourusername/agentic-brand-builder/issues)
- **Feature requests**: [GitHub Issues](https://github.com/yourusername/agentic-brand-builder/issues) with `enhancement` label

### Getting Help

- Check [README.md](./README.md) and [AUDIT_REPORT.md](./AUDIT_REPORT.md)
- Review existing agent implementations
- Ask in GitHub Discussions
- Look at PR examples

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines
- Communicate clearly

## 🙏 Recognition

All contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation

## 📊 Current Needs

**Most Needed Contributions:**
1. 🔴 **Agent Implementations** (37 agents needed)
2. 🟡 **Test Coverage** (40% → 70%+)
3. 🟡 **Integration Tests** (end-to-end flows)
4. 🟢 **Documentation** (agent guides)
5. 🟢 **Bug Fixes** (see issues)

**Difficulty Levels:**
- 🟢 **Easy**: Documentation, small bug fixes
- 🟡 **Medium**: Tests, refactoring
- 🔴 **Hard**: Agent implementations

## 🎉 Thank You!

Every contribution helps move this project toward 100% completion. Whether you implement one agent, write tests, or improve documentation - you're making a real impact!

**Current Status**: 7.5% complete (3 of 40 agents)
**Goal**: 100% complete production system
**Your contribution**: Brings us closer to the goal!

---

**Questions?** Open a [GitHub Discussion](https://github.com/yourusername/agentic-brand-builder/discussions)

**Ready to contribute?** Pick an agent from [ROADMAP.md](./ROADMAP.md) and get started!
