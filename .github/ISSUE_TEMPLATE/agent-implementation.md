---
name: Agent Implementation
about: Propose implementing a new agent
title: '[AGENT] Implement [Agent Name]'
labels: 'enhancement, agent-implementation, help wanted'
assignees: ''
---

## Agent Information

**Agent Name**: [e.g., PDF Extraction Agent]
**Stage**: [e.g., Stage 1 - Data Ingestion]
**Priority**: [High/Medium/Low - see ROADMAP.md]
**Estimated Effort**: [2-4 days]

## Description

Brief description of what this agent should do.

## Functionality Requirements

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Input

What data/context does this agent need?

```typescript
{
  context: BrandContext,
  previousStageOutputs: {
    // What data from previous stages?
  }
}
```

## Expected Output

What should this agent return?

```typescript
{
  data: {
    // Expected structure
  },
  confidence: 0.85,
  sources: ['source1', 'source2']
}
```

## Implementation Checklist

- [ ] Create agent class (extends BaseAgent)
- [ ] Implement run() method
- [ ] Add system and user prompts
- [ ] Implement response parsing
- [ ] Add error handling
- [ ] Write unit tests (min 5 tests)
- [ ] Add integration test
- [ ] Register in AgentFactory
- [ ] Add to StageOrchestrator
- [ ] Update documentation
- [ ] All quality checks passing

## Dependencies

- [ ] Depends on: [Other agents or data]
- [ ] Requires: [External libraries/APIs]

## Testing Strategy

How will this agent be tested?
- Unit tests for...
- Integration tests for...
- Manual testing with...

## Additional Context

Any other relevant information, examples, or references.

## Related

- Related to ROADMAP.md: [Week X, Phase Y]
- Blocks: #[issue numbers]
- See also: [Links to documentation]
