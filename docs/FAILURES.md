# Failed Approaches & Lessons Learned

> **Purpose**: Document what DIDN'T work so we don't repeat mistakes in future versions

**Last Updated**: 2025-10-17

---

## Quick Reference

| Failed Approach | Why It Failed | What We Learned | Replacement |
|----------------|---------------|-----------------|-------------|
| Single-LLM extraction | 80% hallucination rate | Never prompt LLM to extract data | 6-stage pipeline with real libraries ([ADR-001], [ADR-002]) |
| Prompt-based PDF extraction | Fabricated entire brand documents | Use libraries for extraction, LLM for reasoning | pdf-parse library ([ADR-002]) |
| PlaceholderAgents | Masked implementation gaps, fake success | Fake success worse than explicit failure | Explicit errors, only schedule implemented agents ([ADR-003]) |
| Logical OR (||) for confidence defaults | Masked genuine 0 values | 0 is valid (uncertainty), must preserve | Nullish coalescing (??) ([ADR-004]) |
| Unbounded prompt context | Exponential prompt size growth | Always budget/limit accumulated state | formatPreviousOutputs max 20k chars |
| No rate limiting | API hammering, 429 errors | Parallel agents need back-pressure | RateLimiter with queue |
| 3-stage pipeline | Still 40% hallucination | Insufficient specialization | 6-stage with 35 agents |
| 36 agents (14 placeholders) | Silent fabrication | Only implement what's needed | 22 real agents |

---

## Detailed Failures

### 1. Single Monolithic LLM Call (September 15-28, 2025)

**What We Tried:**
```typescript
// One massive prompt to do everything
const prompt = `Based on the brand name "${brandName}" and
these files: ${filenames.join(', ')}, generate a complete
brand intelligence document including positioning, competitors,
strategy, and recommendations.`;

const response = await claude.messages.create({ prompt });
```

**Why It Failed:**
- **Hallucination rate: 80%+** - Fabricated positioning, competitors, values
- **Generic outputs** - Missed brand-specific nuances
- **Unmaintainable** - 10k+ token prompt impossible to debug
- **No error recovery** - Single point of failure
- **Extraction completeness: 40%**

**Evidence:**
- Test on Flyberry brand created fake competitor "FreshBerry" that doesn't exist
- Brand positioning was generic platitudes, not actual brand strategy
- User feedback: "Too generic, doesn't capture our uniqueness"

**Replacement:** 6-stage pipeline with 35 specialized agents ([ADR-001])

---

### 2. Prompt-Based PDF Extraction (September 15 - October 16, 2025)

**What We Tried:**
```typescript
const prompt = `Based on the filename "brand-book.pdf" and
brand name "Flyberry", provide what would typically be extracted
from this document.`;
```

**Why It Failed:**
- LLM completely fabricated brand attributes not in the PDF
- Created fictional competitors, values, positioning
- Impossible to verify if extraction was real vs hallucinated
- Propagated fabrications through all 6 stages

**Evidence:**
- Flyberry PDF extraction invented "premium gourmet positioning" that wasn't in document
- Created brand values like "sustainability" that weren't mentioned
- Downstream stages built strategies on these hallucinations

**What We Learned:**
> **Never ask an LLM to extract data. Use real libraries.**
>
> - PDF extraction: pdf-parse
> - Web scraping: cheerio
> - Images: Puppeteer screenshots
> - LLM usage: ONLY for reasoning on extracted data

**Replacement:** pdf-parse library for real extraction, LLM for analysis only ([ADR-002])

---

### 3. PlaceholderAgent Pattern (September 20 - October 16, 2025)

**What We Tried:**
```typescript
class PlaceholderAgent extends BaseAgent {
  async execute(): Promise<AgentOutput> {
    return {
      status: 'success',  // ✅ Green checkmark
      data: { placeholder: true },
      confidence: 0.5,  // False confidence
    };
  }
}

// Orchestrator showed:
// ✅ Stage 3: Market Gap Analysis - Success
// (was actually a placeholder!)
```

**Why It Failed:**
- **Masked true implementation state** - Showed 36 agents working when only 22 existed
- **Built downstream on fabricated inputs** - Stages 4-6 used placeholder data
- **Debugging nearly impossible** - Everything showed green, but outputs were nonsense
- **Undermined system trust** - Could never trust a "success" status

**The "Appearance of Success" Problem:**
System showed ✅✅✅ while running entirely on fabricated data. This is infinitely worse than explicit ❌ failures because:
- Users can fix errors
- Users cannot detect fabrication

**What We Learned:**
> **Fake success is worse than explicit failure.**
>
> Better to crash loudly than succeed silently on fake data.

**Replacement:** Explicit errors in AgentFactory, only schedule implemented agents ([ADR-003])

---

### 4. Logical OR (||) for Confidence Defaults (September 28 - October 16, 2025)

**What We Tried:**
```typescript
return {
  status: 'success',
  data: normalized,
  confidence: normalized.confidence || 0.85,  // BUG!
  // If normalized.confidence = 0, this becomes 0.85
};
```

**Why It Failed:**
- **JavaScript treats 0 as falsy** → `0 || 0.85` evaluates to `0.85`
- **0 is a VALID confidence score** meaning "no confidence / complete uncertainty"
- **Masked genuine uncertainty** - Agents with no data showed 0.85 confidence
- **False confidence propagated** through pipeline

**Evidence:**
```typescript
// Agent had no data:
result.confidence = 0;  // Genuinely uncertain

// Code applied default:
finalConfidence = result.confidence || 0.85;  // Bug: becomes 0.85

// Downstream stages saw:
// "High confidence (0.85)" when should be "No confidence (0)"
```

**What We Learned:**
> **Use ?? (nullish coalescing) not || (logical OR) for numeric defaults.**
>
> - `||` coalesces on falsy values (0, false, "", null, undefined)
> - `??` coalesces only on null/undefined
> - For confidence scores, 0 is VALID (uncertainty)

**Replacement:** Nullish coalescing (`??`) operator ([ADR-004])

---

### 5. Unbounded Prompt Context (October 1-15, 2025)

**What We Tried:**
```typescript
// Include ALL previous outputs in every agent prompt
const previousOutputs = context.getAllOutputs();  // Could be 50k+ tokens
const prompt = `Previous outputs: ${JSON.stringify(previousOutputs)}\n\nNow analyze...`;
```

**Why It Failed:**
- **Exponential growth** - Each stage added more context
- **Hit token limits** - Stage 6 prompts were 180k+ tokens
- **High costs** - $5+ per document due to massive prompts
- **Slower execution** - Large prompts take longer to process

**Evidence:**
- Stage 1 prompt: 5k tokens
- Stage 3 prompt: 45k tokens
- Stage 6 prompt: 185k tokens (hit 200k limit)
- Cost per document: $5.50

**What We Learned:**
> **Always budget and limit accumulated state.**
>
> - Max 5k tokens per stage output
> - Max 20k tokens total previous context
> - Truncate with warnings, not silent overflow

**Replacement:** Prompt budgeting in formatPreviousOutputs (max 20k chars)

---

### 6. No Rate Limiting (September 28 - October 10, 2025)

**What We Tried:**
```typescript
// Fire all agents in parallel with no throttling
const results = await Promise.all(
  agents.map(agent => agent.execute(context))
  // 8 agents all hitting API simultaneously
);
```

**Why It Failed:**
- **429 Rate Limit Errors** - Anthropic API throttled requests
- **Wasted API calls** - Retries consumed quota
- **Unpredictable failures** - Random agents failed based on timing

**Evidence:**
```
Error: 429 Too Many Requests
Stage 2: 8 agents, 5 succeeded, 3 failed with 429
Retry logic made 24 API calls for 8 agents (3x overhead)
```

**What We Learned:**
> **Parallel agents need back-pressure.**
>
> Implement rate limiting BEFORE going parallel.

**Replacement:** RateLimiter class with queue in BaseAgent

---

### 7. Three-Stage Pipeline (October 6-12, 2025)

**What We Tried:**
- Stage 1: Extract all data
- Stage 2: Analyze everything
- Stage 3: Generate final output

**Why It Failed:**
- Stages still too broad (tried to do too much)
- Hallucination improved to 40% but still unacceptable
- Analysis lacked depth due to breadth
- Extraction missed nuances

**Evidence:**
- Still fabricated 2-3 competitors per document
- Brand positioning was generic
- Strategic recommendations were platitudes

**What We Learned:**
> **Need sufficient specialization.**
>
> 3 stages = insufficient granularity
> 6 stages = natural grouping of related tasks

**Replacement:** 6-stage pipeline with 35 specialized agents ([ADR-001])

---

### 8. Scheduling 36 Agents (14 Unimplemented) (September 20 - October 17, 2025)

**What We Tried:**
- Planned 36 agents for comprehensive analysis
- Implemented 22, left 14 as PlaceholderAgents
- Scheduled all 36 in orchestrator

**Why It Failed:**
- See "PlaceholderAgent Pattern" above
- False appearance of comprehensive analysis
- Built outputs on 14 fabricated inputs

**Evidence:**
- 14/36 agents (39%) were returning placeholder data
- Final documents included fabricated market gaps and strategies
- Debugging took hours because "everything worked"

**What We Learned:**
> **Only implement what's needed.**
>
> Better to do 22 things well than 36 things poorly.

**Replacement:** 22 implemented agents, document what was removed ([ADR-003])

---

## Anti-Patterns Identified

### 1. Fabrication Prompts
**Anti-Pattern:** "Based on [filename/brandname], provide what would typically..."

**Why Bad:** LLM fabricates plausible content

**Solution:** Extract with real libraries, analyze with LLM

---

### 2. Silent Placeholders
**Anti-Pattern:** Return fake success for unimplemented features

**Why Bad:** Masks gaps, builds on fabrications, debugging impossible

**Solution:** Explicit errors, loud failures

---

### 3. Guessed Metrics
**Anti-Pattern:** `tokens = successfulExtractions * 4000` (estimate)

**Why Bad:** Undermines trust in entire metrics system

**Solution:** Use real API response data (`usage.total_tokens`)

---

### 4. Falsy-Value Bugs
**Anti-Pattern:** `confidence || 0.85` for numeric defaults

**Why Bad:** 0 is valid (uncertainty), gets replaced with default

**Solution:** Use `??` not `||` for numeric fields

---

### 5. Unimplemented Scheduling
**Anti-Pattern:** Schedule agents that don't exist yet

**Why Bad:** Silent fabrication, false success appearance

**Solution:** Only schedule implemented agents

---

### 6. Unbounded Context
**Anti-Pattern:** Include all previous outputs in every prompt

**Why Bad:** Exponential growth, hits token limits, high costs

**Solution:** Budget limits (max 5k per stage, 20k total)

---

### 7. Write-But-No-Persist
**Anti-Pattern:** Agents generate outputs but don't save them

**Why Bad:** Deliverables inaccessible, outputs lost

**Solution:** Explicit persistence (write to disk, populate outputs array)

---

## Hallucination Symptoms to Watch For

1. **Generic brand positioning** - "We're a premium brand focused on quality"
   - Real brands have specific, unique positioning
   - Generic = likely fabricated

2. **Fictional competitors** - Names that sound plausible but don't exist
   - Always verify competitors exist (web search)
   - If competitor has no web presence, it's fabricated

3. **Made-up brand values** - "Sustainability, innovation, excellence"
   - These are clichés, not specific to any brand
   - Real values are unique and specific

4. **Confident vagueness** - High confidence (0.85) + vague outputs
   - Real analysis is specific
   - Vague + confident = hallucination

5. **Perfect completeness** - Every field filled, no gaps
   - Real data has gaps
   - 100% completeness is suspicious

---

## Lessons for Future Versions

### When Building V2/V3:

1. **Start with Real Data Extraction**
   - Use libraries (pdf-parse, cheerio, etc.)
   - Never prompt LLMs to extract
   - Verify extraction accuracy first

2. **Fail Explicitly**
   - No placeholders
   - No silent gaps
   - Loud errors > fake success

3. **Budget Context**
   - Set limits from Day 1
   - Monitor prompt sizes
   - Truncate before hitting limits

4. **Rate Limit Early**
   - Implement before parallelization
   - Test with realistic loads
   - Monitor 429 errors

5. **Use ?? for Numeric Defaults**
   - Preserve 0 values
   - Document the pattern
   - Lint for || usage

6. **Implement Verification**
   - Artifact validation (files written?)
   - Confidence monitoring (too high?)
   - Completeness checks (too perfect?)

7. **Track Metrics Honestly**
   - Use real API response data
   - No estimates
   - Build trust through accuracy

---

## Related Documentation

- [ADR-001: Six-Stage Pipeline Architecture](./decisions/001-six-stage-pipeline-architecture.md)
- [ADR-002: Real Data Extraction Over LLM Prompts](./decisions/002-real-data-extraction-over-prompts.md)
- [ADR-003: Explicit Failures Over Placeholder Agents](./decisions/003-explicit-failures-over-placeholders.md)
- [ADR-004: Confidence Scoring with Nullish Coalescing](./decisions/004-confidence-scoring-with-nullish-coalescing.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Global Learning Journal](~/.claude/learning/journal.md)

---

**Questions?**
- Check ADRs for detailed analysis of each failure
- Review learning journal for cross-project patterns
- Ask about specific failures not listed here
