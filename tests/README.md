# Test Suite

## Overview

This directory contains comprehensive tests for the Agentic Brand Builder system.

## Test Structure

```
tests/
├── agents/              # Agent tests
│   └── base-agent.test.ts
├── config/              # Configuration tests
│   └── context-manager.test.ts
├── types/               # Type validation tests
│   └── validation.test.ts
└── README.md           # This file
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test tests/agents/base-agent.test.ts

# Run with coverage
npm test -- --coverage
```

## Writing Tests

### Test Naming Convention

- **Describe blocks**: Describe the unit being tested
- **It blocks**: Describe the expected behavior

Example:
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // test
    });
  });
});
```

### Test Categories

1. **Unit Tests**: Test individual functions/classes in isolation
2. **Integration Tests**: Test interaction between components
3. **E2E Tests**: Test complete workflows

## Current Coverage

### Implemented Tests

- ✅ **BaseAgent**: Execution, retry logic, timeout handling
- ✅ **ContextManager**: State management, export/import
- ✅ **Type Validation**: BrandContext schema validation

### Missing Tests (TODO)

- ❌ **MasterOrchestrator**: Full pipeline tests
- ❌ **StageOrchestrator**: Stage execution tests
- ❌ **AgentFactory**: Agent creation tests
- ❌ **Individual Agents**: CompetitorResearchAgent, ReviewAnalysisAgent, PositioningStrategyAgent
- ❌ **Quality Gates**: Validation logic tests
- ❌ **CLI**: Command-line interface tests

## Test Guidelines

### Do's
- ✅ Use descriptive test names
- ✅ Test edge cases
- ✅ Mock external dependencies (API calls)
- ✅ Test error handling
- ✅ Keep tests isolated and independent

### Don'ts
- ❌ Don't make real API calls in tests
- ❌ Don't share state between tests
- ❌ Don't test implementation details
- ❌ Don't write flaky tests

## Mocking

Use Vitest's built-in mocking:

```typescript
import { vi } from 'vitest';

// Mock a module
vi.mock('../../src/module.js', () => ({
  functionName: vi.fn()
}));

// Mock a function
const mockFn = vi.fn();
mockFn.mockReturnValue('mocked value');
```

## Debugging Tests

```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run specific test
npm test -- base-agent

# Debug in VS Code
# Add breakpoint and use "Debug Test" code lens
```

## CI/CD Integration

Tests are automatically run on:
- Pull requests
- Pushes to main branch
- GitHub Actions workflows

Test requirements for PR merge:
- All tests must pass
- Coverage must not decrease

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
