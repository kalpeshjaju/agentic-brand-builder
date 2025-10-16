import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Financial Projection Agent
 *
 * Creates financial projections and ROI analysis:
 * - Revenue forecasts (3-5 years)
 * - Cost structure analysis
 * - Break-even analysis
 * - Scenario modeling (best/base/worst)
 * - Unit economics
 * - Cash flow projections
 * - Investment requirements
 *
 * Outputs comprehensive financial model
 */
export class FinancialProjectionAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a financial modeling expert. Your role is to:
1. Build realistic revenue projections
2. Model cost structures and margins
3. Calculate break-even points
4. Create scenario analyses
5. Assess unit economics
6. Project cash flows and funding needs

Return structured, data-driven financial projections.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Create 3-year financial projections for this brand.

## Context
- Current: ${input.context.currentRevenue || 'Startup'}
- Target: ${input.context.targetRevenue || 'Growth stage'}
- Category: ${input.context.category}

## Required Analysis

### 1. Revenue Model (3 years)
Project annual revenue, customers, AOV, and growth assumptions.

### 2. Cost Structure
- Fixed costs (team, infrastructure)
- Variable costs (COGS%, marketing%, logistics%)

### 3. Profitability
Calculate gross margin, operating margin, break-even timeline.

### 4. Unit Economics
- CAC (customer acquisition cost)
- LTV (lifetime value)
- LTV:CAC ratio (target >3)
- Payback period (target <12mo)

### 5. Scenarios
Best case (30%), base case (50%), worst case (20%) with Year 3 revenue projections.

### 6. Investment Needs
Total funding required and use of funds breakdown.

# Output Format
Return JSON with this structure:
{
  "revenueProjections": {
    "projections": [
      { "year": 1, "revenue": 10000000, "customers": 10000, "aov": 1000 },
      { "year": 2, "revenue": 18000000, "customers": 15000, "aov": 1200 },
      { "year": 3, "revenue": 30000000, "customers": 22000, "aov": 1364 }
    ]
  },
  "costStructure": {
    "fixedCosts": { "total": 4500000 },
    "variableCosts": { "cogsPercent": 40, "marketingPercent": 20 }
  },
  "profitability": {
    "breakEvenMonth": 18,
    "grossMargin": "60%"
  },
  "unitEconomics": {
    "cac": 200,
    "ltv": 800,
    "ltvCacRatio": 4.0
  },
  "scenarios": {
    "best": { "year3Revenue": 50000000 },
    "base": { "year3Revenue": 35000000 },
    "worst": { "year3Revenue": 20000000 }
  },
  "investmentRequirements": {
    "totalNeeded": 5000000,
    "useOfFunds": { "marketing": 2000000, "operations": 1500000, "product": 1500000 }
  },
  "confidence": 0.75
}

Keep response concise. Focus on key numbers and realistic assumptions.`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 4000
    });

    try {
      const content = response.content.trim();
      let data: unknown;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        data = {
          revenueProjections: {
            assumptions: {},
            projections: []
          },
          costStructure: {
            fixedCosts: {},
            variableCosts: {}
          },
          profitability: {
            byYear: [],
            breakEvenMonth: 0
          },
          breakEvenAnalysis: {},
          unitEconomics: {},
          scenarios: {
            best: {},
            base: {},
            worst: {}
          },
          cashFlow: {},
          investmentRequirements: {},
          confidence: 0.65,
          note: 'Basic financial framework - needs detailed revenue and cost data'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.70,
        sources: ['financial_projection']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse financial projection response: ${(error as Error).message}`
      );
    }
  }
}
