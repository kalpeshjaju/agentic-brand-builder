# 003: Explicit Failures Over Placeholder Agents

**Date**: 2025-10-17
**Status**: Accepted
**Deciders**: Kalpesh, Claude
**Consulted**: N/A

---

## Context

**Problem**: During development, we had 36 agents planned in the architecture, but only 22 were actually implemented.

**What happened**:
- Master orchestrator scheduled all 36 agents to run
- 14 non-existent agents returned placeholder data with green checkmarks (✅)
- Pipeline showed "success" while running on completely fabricated data
- Downstream stages built analyses on hallucinated inputs
- **Debugging was nearly impossible** - everything "worked"

**Business Impact**: Production brand documents were built on fake data, undermining client trust.

---

## Problem Statement

How should the system behave when an agent is not yet implemented?

---

## Tried & Failed

### Attempt 1: PlaceholderAgent Returns Mock Data
- **What we tried**: Created a `PlaceholderAgent` that returned fake "successful" data for unimplemented agents
- **Implementation**:
  ```typescript
  // src/agents/agent-factory.ts (OLD)
  class PlaceholderAgent extends BaseAgent {
    async execute(context): Promise<AgentOutput> {
      return {
        status: 'success',  // ✅ GREEN CHECKMARK
        data: {
          placeholder: true,
          message: 'Agent not yet implemented',
        },
        confidence: 0.5,  // False confidence
      };
    }
  }

  // Master orchestrator showed:
  // ✅ Stage 1: 8/8 agents completed successfully
  // ✅ Stage 2: 8/8 agents completed successfully
  // (14 were actually placeholders!)
  ```
- **Why we tried it**:
  - Wanted to test orchestration flow before implementing all agents
  - Thought it would help identify integration issues early
  - Didn't want pipeline to crash
- **Why it failed**:
  - **Masked true state of implementation**
  - **Built downstream decisions on fabricated inputs**
  - **Made debugging nearly impossible** (everything showed green)
  - **Undermined confidence in the entire system**
  - **No way to distinguish real success from fake success**
- **Evidence**:
  ```bash
  # Pipeline output showed:
  ✅ Stage 3: Market Gap Analysis - Success (confidence: 0.5)
  ✅ Stage 3: Competitive Differentiation - Success (confidence: 0.5)
  # ^^^ Both were placeholders, downstream stages used this fake data

  # Final output showed made-up competitors and strategies
  # based on placeholder inputs
  ```
- **When**: September 20 - October 16, 2025

### Attempt 2: PlaceholderAgent with Warning Labels
- **What we tried**: Keep placeholders but add `[PLACEHOLDER]` labels to output
- **Why we tried it**: Wanted visual indicator of fake data
- **Why it failed**:
  - Labels got lost in complex data flows
  - Orchestrator still counted them as "success"
  - Didn't prevent downstream agents from using the data
- **When**: October 10-12, 2025

---

## Decision

**Explicit, loud failures for unimplemented agents:**

1. **Remove PlaceholderAgent completely**
2. **AgentFactory throws error** if agent type not implemented
3. **Master orchestrator only schedules implemented agents**
4. **Failures are loud and obvious, not hidden**

**Core principle**: Fake success is worse than explicit failure.

---

## Implementation

**Before (Placeholders):**
```typescript
// src/agents/agent-factory.ts (OLD)
export class AgentFactory {
  static create(type: AgentType): BaseAgent {
    switch (type) {
      case 'pdf-extraction':
        return new PdfExtractionAgent();
      case 'market-gap':
        return new PlaceholderAgent();  // Returns fake success!
      default:
        return new PlaceholderAgent();  // Returns fake success!
    }
  }
}

// src/orchestrator/master-orchestrator.ts (OLD)
const stage3Agents = [
  'market-gap',           // Not implemented - placeholder
  'competitive-diff',     // Not implemented - placeholder
  'brand-positioning',    // Implemented ✅
  // ... 7 more (4 were placeholders)
];
```

**After (Explicit Failures):**
```typescript
// src/agents/agent-factory.ts (NEW)
export class AgentFactory {
  static create(type: AgentType): BaseAgent {
    switch (type) {
      case 'pdf-extraction':
        return new PdfExtractionAgent();
      case 'data-normalization':
        return new DataNormalizationAgent();
      case 'context-builder':
        return new ContextBuilderAgent();
      // ... only implemented agents

      default:
        // LOUD, EXPLICIT ERROR
        throw new Error(
          `Agent type "${type}" is not yet implemented. ` +
          `This agent was removed from schedules on 2025-10-17. ` +
          `If you need this agent, implement it in src/agents/ first.`
        );
    }
  }
}

// src/orchestrator/master-orchestrator.ts (NEW)
const stage3Agents = [
  'brand-positioning',    // Implemented ✅
  'value-proposition',    // Implemented ✅
  'messaging-framework',  // Implemented ✅
  // Only 22 implemented agents scheduled (removed 14 placeholders)
];

// Documentation of what was removed:
// docs/REMOVED_AGENTS.md lists the 14 unimplemented agents and why
```

**Files changed:**
- `src/agents/agent-factory.ts:28-45` - Removed PlaceholderAgent, added explicit errors
- `src/orchestrator/master-orchestrator.ts:67-123` - Removed 14 unimplemented agents from schedules
- `docs/REMOVED_AGENTS.md` - Documented what was removed and why

---

## Options Considered

### Option 1: Explicit Failures (Throw Errors) ✅ (CHOSEN)
- **Pros**:
  - ✅ Failures are loud and obvious
  - ✅ Cannot accidentally use fake data
  - ✅ Forces honesty about implementation status
  - ✅ Makes debugging easier (real failures, not fake successes)
  - ✅ Build trust (system says what it does)
- **Cons**:
  - ❌ Pipeline fails if wrong agent scheduled
  - ❌ Can't test orchestration flow with placeholders
- **Cost**: None (simpler code)

### Option 2: Placeholders with Warnings
- **Pros**:
  - Can test orchestration flow
  - Pipeline doesn't crash
- **Cons**:
  - Fake success is worse than real failure
  - Warnings get ignored in complex flows
  - Undermines system trust
- **Why rejected**: Unacceptable for production

### Option 3: Skip Unimplemented Agents (No Error)
- **Pros**:
  - Pipeline continues without crashing
  - No fake data
- **Cons**:
  - Silent skipping hides gaps
  - Hard to know what's missing
  - Incomplete outputs without explanation
- **Why rejected**: Too silent, doesn't force fixes

---

## Consequences

### Positive
- ✅ **100% of "success" status is real** - No fake successes
- ✅ **Debugging is straightforward** - Errors point to real problems
- ✅ **System trustworthy** - Says what it does, does what it says
- ✅ **Forces implementation** - Can't schedule unimplemented agents
- ✅ **Cleaner codebase** - Removed 14 placeholder entries

### Negative
- ❌ **Cannot test orchestration without implementing all agents**
- ❌ **Pipeline fails loudly if misconfigured**
- ❌ **Need to maintain list of implemented agents**

### Trade-offs Accepted
- **Testing convenience for production trust**: Cannot test flow with placeholders, but outputs are always real
- **Silence for honesty**: Loud failures instead of silent gaps

---

## Success Metrics

| Metric | Before (Placeholders) | Target | Current |
|--------|-----------------------|--------|---------|
| Fake Successes | 14 per run | 0 | 0 ✅ |
| Confidence in Outputs | Low | High | High ✅ |
| Debugging Time | Hours | Minutes | Minutes ✅ |
| Implemented Agents Scheduled | 22/36 (61%) | 100% | 22/22 (100%) ✅ |
| Production Trust | Low | High | High ✅ |

**Review date**: 2025-11-17

---

## Related Decisions

- Depends on: [ADR-001] Six-Stage Pipeline Architecture
- Related to:
  - [ADR-002] Real Data Extraction (both about eliminating fabrication)
  - [ADR-005] Confidence Scoring with ?? not ||
- Supersedes: None
- Superseded by: None

---

## References

- Learning Journal: `~/.claude/learning/journal.md:82-171` (Hallucination fixes entry)
- Architecture Doc: `docs/ARCHITECTURE.md`
- Removed Agents: `docs/REMOVED_AGENTS.md`

---

## Notes

**List of 14 Removed Placeholder Agents:**

Stage 2 (removed 4):
- Sentiment analysis agent
- Brand health scoring agent
- Market trend analysis agent
- Customer journey mapping agent

Stage 3 (removed 3):
- Market gap analysis agent
- Competitive differentiation agent
- Innovation opportunities agent

Stage 4 (removed 2):
- Social media content agent
- Email campaign agent

Stage 5 (removed 3):
- Sentiment consistency agent
- Brand voice scoring agent
- Readability analysis agent

Stage 6 (removed 2):
- Multi-format export agent
- Distribution automation agent

**Why they were placeholders:**
- Out of scope for V1
- Insufficient time to implement
- Uncertain value proposition
- May be added in future versions

**The Appearance of Success Problem:**

This issue revealed a critical anti-pattern:

> **Anti-Pattern**: Systems that show green checkmarks (✅) while running on fabricated data
>
> **Why it's dangerous**:
> - Masks true implementation state
> - Builds downstream on hallucinated inputs
> - Makes debugging nearly impossible
> - Undermines confidence in entire system
>
> **Solution**: Fail fast, fail loud, fail explicitly

**Key Learning:**
> "In AI systems, fake success is infinitely worse than explicit failure.
> Users can fix errors, but cannot detect fabrication."
