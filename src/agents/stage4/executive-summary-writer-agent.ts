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
Create a comprehensive executive summary synthesizing all brand strategy analysis.

## Executive Summary Framework

### 1. The Opportunity

**Market Context**:
- Market size and growth rate
- Current market position
- White space opportunities
- Timing and urgency
- Why now?

**Customer Opportunity**:
- Unmet customer needs
- Pain points we solve
- Jobs to be done
- Target segments
- Market demand signals

**Competitive Opportunity**:
- Market gaps
- Competitor weaknesses
- Our differentiation
- Barriers to entry
- Sustainable advantage

### 2. The Strategy

**Strategic Direction**:
- Vision and ambition
- Core positioning
- Target audience
- Value proposition
- Differentiation strategy

**Go-to-Market**:
- Market entry approach
- Channel strategy
- Pricing strategy
- Customer acquisition
- Geographic expansion

**Growth Strategy**:
- Phase 1: Foundation
- Phase 2: Scale
- Phase 3: Expansion
- Revenue drivers
- Growth levers

### 3. Key Insights

**Top 5-7 Insights** (prioritized):
1. **Insight headline**
   - Supporting evidence
   - Business implication
   - Recommended action

Format each insight as:
- **What we learned**: [Discovery]
- **Why it matters**: [Business impact]
- **What to do**: [Action]
- **Evidence**: [Data/source]

### 4. Recommended Actions

**Immediate Priorities** (Next 90 days):
1. Action item
   - Why critical
   - Expected outcome
   - Resources needed
   - Success metric

**Short-term** (3-6 months):
- Critical initiatives
- Dependencies
- Milestones

**Medium-term** (6-12 months):
- Strategic initiatives
- Investment areas
- Capability building

**What Not to Do**:
- Deprioritized initiatives
- Rationale for exclusion

### 5. Expected Outcomes

**Financial Outcomes** (3-year projection):
- Revenue targets
- Profitability timeline
- Market share goals
- Unit economics
- Return on investment

**Strategic Outcomes**:
- Brand positioning achieved
- Market position
- Customer base
- Competitive standing
- Brand equity

**Operational Outcomes**:
- Capabilities built
- Systems implemented
- Team developed
- Partnerships established

**Risk-Adjusted Scenarios**:
- Best case (30% probability)
- Base case (50% probability)
- Worst case (20% probability)

### 6. Investment Required

**Total Investment Needed**:
- Year 1: ₹XX Cr
- Year 2: ₹XX Cr
- Year 3: ₹XX Cr

**Use of Funds**:
- Brand development: XX%
- Product/service: XX%
- Marketing: XX%
- Technology: XX%
- Operations: XX%
- Working capital: XX%

**Funding Strategy**:
- Sources of capital
- Funding timeline
- Dilution/terms
- Runway provided

**Return Profile**:
- Payback period
- ROI projection
- IRR expectation
- Exit opportunities

### 7. Success Metrics

**Primary KPIs**:
- Revenue growth
- Market share
- Customer acquisition
- Brand awareness
- Profitability

**Secondary KPIs**:
- Customer metrics (CAC, LTV, retention)
- Brand metrics (awareness, consideration)
- Operational metrics (efficiency, quality)

**Review Cadence**:
- Weekly: Operations
- Monthly: Performance
- Quarterly: Strategy
- Annually: Planning

### 8. Risks & Mitigation

**Top 5 Risks**:
1. **Risk**: [Description]
   - **Impact**: High/Medium/Low
   - **Probability**: High/Medium/Low
   - **Mitigation**: [Strategy]
   - **Contingency**: [Plan B]

# Output Format
Provide structured JSON:
{
  "executiveSummary": {
    "opportunity": {
      "marketContext": {
        "marketSize": "₹5000 Cr",
        "growth": "15% CAGR",
        "position": "Challenger brand",
        "timing": "Premium segment underserved",
        "urgency": "Window of opportunity: 18 months"
      },
      "customerOpportunity": {
        "unmetNeeds": ["Quality at fair prices", "Authentic ingredients"],
        "painPoints": ["Overpriced premium", "Low-quality budget"],
        "targetSegments": ["Urban millennials", "Health-conscious families"]
      },
      "competitiveOpportunity": {
        "gaps": ["Mid-premium positioning vacant"],
        "differentiation": "Artisanal quality at accessible prices",
        "barriers": "Brand trust, distribution network"
      }
    },
    "strategy": {
      "vision": "Make premium accessible to all",
      "positioning": "Premium quality, honest pricing",
      "targetAudience": "Aspirational middle class",
      "valueProposition": "Artisan quality without luxury markup",
      "goToMarket": {
        "entry": "D2C-first, selective retail",
        "channels": ["Website", "Instagram", "Pop-ups"],
        "pricing": "30% below premium brands",
        "acquisition": "Content marketing + influencers"
      }
    },
    "keyInsights": [
      {
        "priority": 1,
        "headline": "Mid-premium white space confirmed",
        "whatWeLearn": "47% of customers want premium but can't afford luxury prices",
        "whyItMatters": "₹2000 Cr untapped market segment",
        "whatToDo": "Launch mid-premium line immediately",
        "evidence": "Market research (500 interviews), competitor analysis",
        "confidence": 0.90
      },
      {
        "priority": 2,
        "headline": "Authenticity beats perfection for target audience",
        "whatWeLearn": "Customers value transparency over polish",
        "whyItMatters": "Lower content production costs, higher engagement",
        "whatToDo": "Shift to user-generated content strategy",
        "evidence": "Social media analysis (50K posts)",
        "confidence": 0.85
      }
    ],
    "recommendedActions": {
      "immediate": [
        {
          "action": "Launch D2C website",
          "critical": "Foundation for all marketing",
          "outcome": "Direct customer relationships",
          "resources": "₹10L, 2 developers, 4 weeks",
          "metric": "1000 visitors/day by Month 2"
        }
      ],
      "shortTerm": [
        {
          "initiative": "Influencer partnerships",
          "timeline": "Months 2-4",
          "milestone": "10 micro-influencer deals"
        }
      ],
      "mediumTerm": [
        {
          "initiative": "Retail expansion",
          "timeline": "Months 6-12",
          "investment": "₹50L"
        }
      ],
      "deprioritized": [
        {
          "initiative": "International expansion",
          "rationale": "Premature - establish domestic first"
        }
      ]
    },
    "expectedOutcomes": {
      "financial": {
        "year1": { "revenue": "₹10 Cr", "margin": "-5%" },
        "year2": { "revenue": "₹25 Cr", "margin": "8%" },
        "year3": { "revenue": "₹50 Cr", "margin": "15%" },
        "marketShare": "2% by Year 3",
        "roi": "3.5x over 3 years"
      },
      "strategic": {
        "positioning": "Established mid-premium leader",
        "brandAwareness": "40% in target segment",
        "customerBase": "100K active customers",
        "competitivePosition": "Top 3 in segment"
      },
      "scenarios": {
        "best": { "year3Revenue": "₹75 Cr", "probability": 0.30 },
        "base": { "year3Revenue": "₹50 Cr", "probability": 0.50 },
        "worst": { "year3Revenue": "₹30 Cr", "probability": 0.20 }
      }
    },
    "investmentRequired": {
      "total": "₹15 Cr over 3 years",
      "breakdown": {
        "year1": "₹5 Cr",
        "year2": "₹6 Cr",
        "year3": "₹4 Cr"
      },
      "useOfFunds": {
        "brandDevelopment": "15%",
        "productDevelopment": "25%",
        "marketing": "35%",
        "technology": "10%",
        "operations": "10%",
        "workingCapital": "5%"
      },
      "funding": {
        "sources": ["Seed round ₹5 Cr", "Series A ₹10 Cr"],
        "timeline": "Q1 2025, Q3 2025",
        "runway": "18 months post-seed"
      },
      "returns": {
        "payback": "24 months",
        "projectedROI": "3.5x",
        "irr": "65%"
      }
    },
    "successMetrics": {
      "primary": {
        "revenue": "₹10 Cr Year 1",
        "marketShare": "0.5% Year 1",
        "customers": "25K Year 1",
        "awareness": "15% Year 1",
        "profitability": "Month 18"
      },
      "secondary": {
        "cac": "₹200",
        "ltv": "₹800",
        "retention": "60%",
        "nps": "50+"
      },
      "reviewCadence": {
        "weekly": "Operations dashboard",
        "monthly": "Performance review",
        "quarterly": "Strategy review",
        "annual": "Planning cycle"
      }
    },
    "risks": [
      {
        "rank": 1,
        "risk": "Established brands lower prices",
        "impact": "high",
        "probability": "medium",
        "mitigation": "Build brand loyalty through community",
        "contingency": "Pivot to super-premium niche"
      },
      {
        "rank": 2,
        "risk": "Customer acquisition costs exceed projections",
        "impact": "high",
        "probability": "medium",
        "mitigation": "Focus on organic/referral channels",
        "contingency": "Reduce growth targets, extend runway"
      }
    ]
  },
  "confidence": 0.85
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 12000
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
