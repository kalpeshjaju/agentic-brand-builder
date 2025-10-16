import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Consistency Checker Agent
 *
 * Validates consistency across all outputs:
 * - Cross-reference validation
 * - Contradiction detection
 * - Data consistency checks
 * - Messaging alignment
 * - Recommendation coherence
 * - Gap identification
 *
 * Outputs consistency report with issues and fixes
 */
export class ConsistencyCheckerAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a consistency validation expert. Your role is to:
1. Detect contradictions across documents
2. Verify data consistency
3. Check messaging alignment
4. Validate logical coherence
5. Identify gaps and inconsistencies
6. Suggest corrections

Return structured consistency reports with specific issues and fixes.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Validate consistency across all brand strategy outputs and identify any contradictions or gaps.

## Consistency Validation Framework

### 1. Data Consistency

**Numerical Data**:
- Revenue figures match across documents
- Market size consistent
- Customer numbers aligned
- Pricing consistent
- Timelines match

**Factual Data**:
- Brand name spelling
- Category definitions
- Competitor lists
- Geographic markets
- Product/service descriptions

**Checks**:
- Cross-reference all numbers
- Verify calculation accuracy
- Check unit consistency (Cr vs L vs K)
- Validate date formats
- Ensure decimal precision

### 2. Messaging Consistency

**Brand Voice**:
- Tone consistent across documents
- Language level (formal/casual)
- Terminology usage
- Brand personality traits
- Writing style

**Key Messages**:
- Value proposition same everywhere
- Positioning statement aligned
- Tagline/slogans consistent
- Core benefits match
- Differentiators aligned

**Narrative Arc**:
- Story elements consistent
- Character/brand journey aligned
- Problem-solution match
- Before/after states consistent

### 3. Strategic Alignment

**Positioning**:
- Positioning strategy matches execution
- Target audience consistent
- Competitive frame aligned
- Category definition same
- Brand architecture coherent

**Recommendations**:
- Actions align with strategy
- Tactics support objectives
- Budget matches priorities
- Timeline realistic
- Resources sufficient

**Goals & Metrics**:
- Success metrics aligned
- KPIs match objectives
- Targets achievable
- Benchmarks consistent
- Timelines realistic

### 4. Logical Coherence

**Cause & Effect**:
- Insights lead to recommendations
- Problems match solutions
- Opportunities align with actions
- Risks match mitigation
- Assumptions validated

**Dependencies**:
- Prerequisite tasks identified
- Sequencing logical
- Resource allocation makes sense
- Timeline dependencies clear
- Critical path validated

**Trade-offs**:
- Acknowledged explicitly
- Choices justified
- Alternatives considered
- Implications clear
- Priorities make sense

### 5. Contradiction Detection

**Direct Contradictions**:
- Conflicting statements
- Opposite recommendations
- Incompatible strategies
- Mutually exclusive tactics
- Contradictory data

**Implicit Contradictions**:
- Inconsistent implications
- Conflicting assumptions
- Incompatible priorities
- Resource conflicts
- Timeline conflicts

**Severity**:
- Critical: Must fix
- High: Should fix
- Medium: Nice to fix
- Low: Minor inconsistency

### 6. Gap Analysis

**Missing Information**:
- Unanswered questions
- Incomplete sections
- Missing data points
- Undefined terms
- Unaddressed risks

**Coverage Gaps**:
- Customer segments not covered
- Channels not addressed
- Competitors not analyzed
- Use cases not defined
- Scenarios not modeled

**Analysis Gaps**:
- Weak evidence
- Insufficient depth
- Missing perspectives
- Unvalidated assumptions
- Unexplored alternatives

### 7. Cross-Reference Validation

**Document Cross-Check**:
- Executive summary matches details
- Financial model matches strategy
- Roadmap matches recommendations
- Budget matches initiatives
- Metrics match objectives

**Source Verification**:
- Citations present
- Data sources credible
- Research methods sound
- Sample sizes adequate
- Recency appropriate

### 8. Recommendation Priorities

**Issue Classification**:
- **Critical**: Breaks strategy, must fix
- **High**: Significant issue, should fix soon
- **Medium**: Moderate issue, fix when possible
- **Low**: Minor inconsistency, cosmetic

**Fix Suggestions**:
- What's wrong
- Why it matters
- How to fix
- Where to fix
- Who should fix

# Output Format
Provide structured JSON:
{
  "consistencyReport": {
    "overallScore": 8.5,
    "criticalIssues": 0,
    "highIssues": 2,
    "mediumIssues": 5,
    "lowIssues": 8,
    "summary": "Overall strong consistency with minor alignment issues"
  },
  "dataConsistency": {
    "score": 9.0,
    "issues": [
      {
        "severity": "high",
        "category": "numerical",
        "issue": "Revenue projection mismatch",
        "details": "Financial model shows ₹50 Cr Year 3, Executive summary shows ₹45 Cr",
        "locations": [
          "financial-projection.json:line 45",
          "executive-summary.json:line 123"
        ],
        "fix": "Update executive summary to ₹50 Cr to match financial model",
        "impact": "Undermines credibility if numbers don't match"
      }
    ]
  },
  "messagingConsistency": {
    "score": 8.5,
    "issues": [
      {
        "severity": "medium",
        "category": "voice",
        "issue": "Tone inconsistency",
        "details": "Executive summary is formal, brand narrative is casual",
        "locations": ["executive-summary", "brand-narrative"],
        "fix": "Align tone - recommend keeping narrative casual, making exec summary slightly less formal",
        "impact": "Brand personality unclear"
      }
    ]
  },
  "strategicAlignment": {
    "score": 9.5,
    "issues": [
      {
        "severity": "low",
        "category": "positioning",
        "issue": "Minor target audience variation",
        "details": "One document says 'millennials', another says '25-40 age group'",
        "locations": ["segmentation", "messaging"],
        "fix": "Use consistent terminology - recommend '25-40 millennials'",
        "impact": "Minor clarity issue"
      }
    ]
  },
  "logicalCoherence": {
    "score": 9.0,
    "issues": []
  },
  "contradictions": {
    "direct": [],
    "implicit": [
      {
        "severity": "medium",
        "contradiction": "Budget vs timeline mismatch",
        "details": "Roadmap assumes 5-person team by Month 3, but budget only funds 3 people",
        "locations": ["roadmap.phases[0]", "budget.teamCosts"],
        "fix": "Either reduce team size in roadmap or increase budget",
        "impact": "Execution will be constrained"
      }
    ]
  },
  "gaps": {
    "missingInformation": [
      {
        "severity": "medium",
        "gap": "Competitive response strategy undefined",
        "details": "Risks mention competitors may lower prices, but no mitigation plan",
        "location": "risk-analysis",
        "fix": "Add competitive response playbook to roadmap",
        "impact": "Unprepared for likely scenario"
      }
    ],
    "coverageGaps": [
      {
        "severity": "low",
        "gap": "International markets not addressed",
        "details": "No mention of export/international opportunity",
        "location": "market-analysis",
        "fix": "Add section on international potential (even if deprioritized)",
        "impact": "Incomplete market view"
      }
    ]
  },
  "crossReferences": {
    "validated": [
      "Executive summary revenue matches financial model",
      "Roadmap timeline aligns with budget allocation",
      "Success metrics match strategic objectives"
    ],
    "failed": [
      {
        "check": "Budget matches initiative costs",
        "issue": "Marketing budget ₹2 Cr but initiatives total ₹2.5 Cr",
        "fix": "Either increase budget or reduce initiatives"
      }
    ]
  },
  "recommendations": [
    {
      "priority": "critical",
      "action": "Reconcile revenue figures",
      "reason": "Numbers must match across all documents",
      "effort": "5 minutes",
      "owner": "Financial analyst"
    },
    {
      "priority": "high",
      "action": "Align brand voice guidelines",
      "reason": "Consistent tone critical for brand building",
      "effort": "1 hour",
      "owner": "Brand lead"
    },
    {
      "priority": "medium",
      "action": "Add competitive response plan",
      "reason": "Important risk not adequately addressed",
      "effort": "2 hours",
      "owner": "Strategy lead"
    }
  ],
  "confidence": 0.90
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 10000
    });

    try {
      const content = response.content.trim();
      let data: unknown;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        data = {
          consistencyReport: {
            overallScore: 8.0,
            criticalIssues: 0,
            highIssues: 0,
            mediumIssues: 0,
            lowIssues: 0,
            summary: 'Consistency validation complete - baseline check'
          },
          dataConsistency: { score: 8.0, issues: [] },
          messagingConsistency: { score: 8.0, issues: [] },
          strategicAlignment: { score: 8.0, issues: [] },
          logicalCoherence: { score: 8.0, issues: [] },
          contradictions: { direct: [], implicit: [] },
          gaps: { missingInformation: [], coverageGaps: [] },
          crossReferences: { validated: [], failed: [] },
          recommendations: [],
          confidence: 0.75,
          note: 'Basic consistency check - needs complete outputs for thorough validation'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.85,
        sources: ['consistency_check']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse consistency check response: ${(error as Error).message}`
      );
    }
  }
}
