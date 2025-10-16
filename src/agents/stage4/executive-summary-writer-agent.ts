import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Executive Summary Writer Agent
 *
 * Synthesizes all analysis into executive summary:
 * - The Opportunity (market context)
 * - The Strategy (recommended approach)
 * - Key Insights (top 5-7 findings)
 * - Recommended Actions (priorities)
 * - Expected Outcomes (projected results)
 * - Investment Required (resources needed)
 *
 * Outputs concise 2-page executive summary
 */
export class ExecutiveSummaryWriterAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are an executive summary writer expert. Your role is to:
1. Synthesize complex analysis into clear insights
2. Identify the most critical findings
3. Present recommendations concisely
4. Quantify expected outcomes
5. Frame business case for leadership
6. Make content scannable and actionable

Return structured, executive-level summaries focused on decisions and impact.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Create executive summary synthesizing brand strategy analysis.

## Required Sections

### 1. The Opportunity
- Market size, growth, and timing
- Customer needs and pain points
- Competitive gaps and differentiation

### 2. The Strategy
- Core positioning and target audience
- Go-to-market approach
- Growth phases and revenue drivers

### 3. Key Insights (Top 5)
For each insight:
- What we learned
- Why it matters
- Recommended action

### 4. Recommended Actions
- Immediate (0-3 months): Top 3 priorities
- Short-term (3-6 months): Key initiatives
- Medium-term (6-12 months): Strategic moves

### 5. Expected Outcomes
- Financial: 3-year revenue, profitability timeline
- Strategic: Market position, brand equity
- Scenarios: Best/base/worst case

### 6. Investment Required
- Total funding needed
- Use of funds breakdown
- Return profile (ROI, payback)

# Output Format
Return JSON:
{
  "executiveSummary": {
    "opportunity": {
      "market": "Market size, growth, timing",
      "customer": ["Unmet needs", "Pain points"],
      "competitive": "Key gaps and differentiation"
    },
    "strategy": {
      "positioning": "Core positioning statement",
      "target": "Target audience",
      "goToMarket": "Channel and pricing approach"
    },
    "keyInsights": [
      {
        "priority": 1,
        "headline": "Insight title",
        "whatWeLearn": "Discovery",
        "whyItMatters": "Impact",
        "whatToDo": "Action"
      }
    ],
    "recommendedActions": {
      "immediate": [{ "action": "Action", "outcome": "Expected result" }],
      "shortTerm": ["Initiative 1", "Initiative 2"],
      "mediumTerm": ["Initiative 3"]
    },
    "expectedOutcomes": {
      "financial": {
        "year1": "₹XX Cr",
        "year3": "₹XX Cr",
        "roi": "Xx over 3 years"
      },
      "strategic": "Market position and brand goals",
      "scenarios": {
        "best": "₹XX Cr",
        "base": "₹XX Cr",
        "worst": "₹XX Cr"
      }
    },
    "investmentRequired": {
      "total": "₹XX Cr",
      "useOfFunds": { "marketing": "XX%", "product": "XX%", "operations": "XX%" },
      "returns": "Payback XX months, ROI Xx"
    }
  },
  "confidence": 0.85
}

Focus on actionable insights. Keep concise.`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 6000
    });

    try {
      const content = response.content.trim();
      let data: unknown;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        data = {
          executiveSummary: {
            opportunity: {},
            strategy: {},
            keyInsights: [],
            recommendedActions: {},
            expectedOutcomes: {},
            investmentRequired: {},
            successMetrics: {},
            risks: []
          },
          confidence: 0.70,
          note: 'Basic executive summary framework - needs comprehensive analysis inputs'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.80,
        sources: ['executive_summary']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse executive summary response: ${(error as Error).message}`
      );
    }
  }
}
