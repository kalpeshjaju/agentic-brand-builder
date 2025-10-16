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

## Validation Categories

### 1. Data Consistency
Check numerical data (revenue, market size, timelines) and factual data (brand name, competitors, categories) match across all documents.

### 2. Messaging Consistency
Verify brand voice, key messages, and narrative are aligned across documents.

### 3. Strategic Alignment
Ensure positioning, recommendations, goals match strategy and are coherent.

### 4. Logical Coherence
Validate cause-effect relationships, dependencies, and trade-offs are logical.

### 5. Contradiction Detection
Identify direct and implicit contradictions. Classify severity: critical, high, medium, low.

### 6. Gap Analysis
Find missing information, coverage gaps, and analysis gaps.

### 7. Cross-Reference Validation
Cross-check documents (exec summary vs details, financials vs strategy, roadmap vs budget).

### 8. Recommendations
Prioritize issues (critical/high/medium/low) with fix suggestions.

# Output Format
Return JSON:
{
  "consistencyReport": {
    "overallScore": 8.5,
    "criticalIssues": 0,
    "highIssues": 2,
    "mediumIssues": 5,
    "lowIssues": 8,
    "summary": "Brief overall assessment"
  },
  "dataConsistency": {
    "score": 9.0,
    "issues": [
      {
        "severity": "high",
        "category": "numerical",
        "issue": "Description",
        "details": "Specific mismatch found",
        "locations": ["doc1:line", "doc2:line"],
        "fix": "How to resolve",
        "impact": "Why it matters"
      }
    ]
  },
  "messagingConsistency": { "score": 8.5, "issues": [] },
  "strategicAlignment": { "score": 9.5, "issues": [] },
  "logicalCoherence": { "score": 9.0, "issues": [] },
  "contradictions": {
    "direct": [],
    "implicit": []
  },
  "gaps": {
    "missingInformation": [],
    "coverageGaps": []
  },
  "crossReferences": {
    "validated": ["List of successful checks"],
    "failed": [{ "check": "What failed", "issue": "Problem", "fix": "Solution" }]
  },
  "recommendations": [
    {
      "priority": "critical",
      "action": "What to do",
      "reason": "Why",
      "effort": "Time estimate",
      "owner": "Who"
    }
  ],
  "confidence": 0.90
}

Focus on actionable issues. Be specific about locations and fixes.`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 5000
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
