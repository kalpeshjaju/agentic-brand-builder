# [Number]: [Title of Decision]

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded by [ADR-XXX]
**Deciders**: [Names]
**Consulted**: [Names]

---

## Context

What problem are we trying to solve? What's the current situation?

- Business context: Why does this matter?
- Technical context: What's the current implementation?
- Constraints: What are we working within?

---

## Problem Statement

Clear, concise statement of the problem that requires a decision.

---

## Tried & Failed (Critical)

**What approaches did we try BEFORE this decision?**

### Attempt 1: [Name]
- **What we tried**: [Description]
- **Why we tried it**: [Reasoning]
- **Why it failed**: [Specific failure modes]
- **Evidence**: [Metrics, errors, user feedback]
- **When**: [Date range]

### Attempt 2: [Name]
- **What we tried**: [Description]
- **Why we tried it**: [Reasoning]
- **Why it failed**: [Specific failure modes]
- **Evidence**: [Metrics, errors, user feedback]
- **When**: [Date range]

---

## Decision

**What did we decide to do?**

Clear statement of the chosen approach.

---

## Options Considered

### Option 1: [Chosen Option] ✅
- **Pros**:
  - Pro 1
  - Pro 2
- **Cons**:
  - Con 1
  - Con 2
- **Cost**: [Time, complexity, dependencies]

### Option 2: [Alternative]
- **Pros**:
- **Cons**:
- **Why rejected**:

### Option 3: [Alternative]
- **Pros**:
- **Cons**:
- **Why rejected**:

---

## Consequences

### Positive
- ✅ Consequence 1
- ✅ Consequence 2

### Negative
- ❌ Consequence 1
- ❌ Consequence 2

### Trade-offs Accepted
- What we're giving up for what we're gaining

---

## Implementation

**Where is this implemented?**

- Files: `src/path/to/file.ts:line-range`
- Configuration: `config/file.json`
- Dependencies: `package.json` (new packages added)

**How to verify it works:**
```bash
# Commands to test/verify
npm test
npm run specific-test
```

**Rollback plan:**
- How to undo if this doesn't work out

---

## Success Metrics

**How do we know this decision was right?**

| Metric | Before | Target | Current |
|--------|--------|--------|---------|
| Metric 1 | X | Y | - |
| Metric 2 | X | Y | - |

**Review date**: YYYY-MM-DD (when we'll reassess)

---

## Related Decisions

- Depends on: [ADR-XXX]
- Related to: [ADR-XXX]
- Supersedes: [ADR-XXX]
- Superseded by: [ADR-XXX]

---

## References

- [Link to relevant documentation]
- [Link to research/articles]
- [Link to discussions/issues]

---

## Notes

Any additional context, caveats, or information.
