# Architecture Decision Records (ADRs)

## What is this?

This directory contains **Architecture Decision Records** - documents that capture important architectural decisions made in this project.

## Why do we need this?

**Problem we're solving:**
- Projects evolve: features change, architectures pivot, tech stacks get replaced
- Each new version risks starting from scratch
- We lose knowledge about:
  - WHY we made certain decisions
  - WHAT approaches failed and why
  - WHAT implementations solve which problems
  - WHAT to preserve vs what to change

**What ADRs capture:**
- ✅ Context: What problem were we solving?
- ✅ Failed attempts: What did we try first that didn't work?
- ✅ Decision: What did we finally choose?
- ✅ Consequences: What trade-offs did we accept?
- ✅ Implementation: Where is this in the code?
- ✅ Metrics: How do we know it works?

## When to create an ADR

**ALWAYS create an ADR for:**
- Major architectural changes (e.g., moving from monolith to pipeline)
- Tech stack changes (e.g., OpenAI → Anthropic)
- Failed experiments (e.g., tried approach X, didn't work, here's why)
- Design pattern adoptions (e.g., agent-based vs single-prompt)
- Data model changes (e.g., how we structure context)

**OPTIONAL for:**
- Minor refactors (unless they teach a lesson)
- Obvious decisions with no alternatives
- Reversible low-stakes choices

## How to create an ADR

1. Copy `000-adr-template.md`
2. Name it: `[next-number]-[short-title].md`
   - Example: `001-chose-stage-pipeline-architecture.md`
3. Fill in ALL sections (especially "Tried & Failed")
4. Commit with the implementation

## Numbering

- Start at `001`
- Increment sequentially
- Use 3 digits: `001`, `002`, ..., `042`
- Don't reuse numbers

## Status Values

- **Proposed**: Under discussion
- **Accepted**: Decision made, implemented
- **Deprecated**: No longer valid, but kept for history
- **Superseded by [ADR-XXX]**: Replaced by a newer decision

## Critical Section: "Tried & Failed"

**This is the MOST IMPORTANT section.**

When documenting a decision, ALWAYS include:
- What approaches we tried BEFORE this
- Why each failed
- What evidence we have
- What we learned

**Example:**
```markdown
## Tried & Failed

### Attempt 1: Single-LLM extraction
- **What we tried**: One 10k-token prompt to extract all brand info
- **Why we tried it**: Simplicity, fewer API calls
- **Why it failed**:
  - Hallucination rate: 80%
  - Generic outputs, missed specific details
  - Unmaintainable prompt
- **Evidence**:
  - Test results: 40% extraction completeness
  - User feedback: "Too generic, missing our unique positioning"
- **When**: 2025-09-15 to 2025-09-28

### Attempt 2: Chain-of-thought prompting
- **What we tried**: Added reasoning steps to single prompt
- **Why we tried it**: Research showed CoT improves accuracy
- **Why it failed**: Still fabricated data when info wasn't present
- **Evidence**: Fabrication rate dropped only to 60%
- **When**: 2025-09-29 to 2025-10-05
```

## How to find relevant ADRs

**By topic:**
```bash
grep -r "pipeline" docs/decisions/
```

**By status:**
```bash
grep "Status: Accepted" docs/decisions/*.md
```

**By date:**
```bash
ls -lt docs/decisions/
```

**By related decision:**
```bash
# Look for "Related Decisions" section in each ADR
```

## Integration with Learning System

ADRs complement the global learning system:

- **ADRs**: Project-specific architectural decisions
- **`~/.claude/learning/journal.md`**: Cross-project learnings
- **`~/.claude/learning/patterns.md`**: Reusable solutions

**When to use which:**
- Use ADR for: "In THIS project, we decided X because Y failed"
- Use journal for: "Across projects, pattern X works better than Y"

## Examples

See existing ADRs in this directory for real examples.

---

**Last updated**: 2025-10-17
