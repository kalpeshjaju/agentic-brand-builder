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
Create comprehensive financial projections for this brand's growth strategy.

## Financial Projection Framework

### 1. Revenue Projections (3-5 Years)

**Base Assumptions**:
- Current revenue: ${input.context.currentRevenue || 'To be determined'}
- Target revenue: ${input.context.targetRevenue || 'To be determined'}
- Market size and growth rate
- Market share assumptions
- Customer acquisition rate

**Revenue Drivers**:
- Number of customers
- Average order value (AOV)
- Purchase frequency
- Customer lifetime value (CLTV)
- Churn rate

**Projection Model**:
Year 1, 2, 3, 4, 5 with:
- Revenue
- Customer count
- AOV
- Transaction volume

### 2. Cost Structure Analysis

**Fixed Costs**:
- Salaries and benefits
- Rent and utilities
- Technology infrastructure
- Insurance and legal

**Variable Costs**:
- Cost of goods sold (COGS)
- Marketing and advertising
- Shipping and logistics
- Payment processing
- Customer support

**Cost Assumptions**:
- COGS as % of revenue
- Marketing as % of revenue
- Operating expenses

### 3. Profitability Analysis

**Key Metrics**:
- Gross margin
- Operating margin
- Net margin
- EBITDA

**Profitability Timeline**:
- When do we break even?
- When do we become profitable?
- Path to profitability

### 4. Break-Even Analysis

**Break-Even Calculation**:
- Fixed costs / (Price - Variable cost per unit)
- Monthly revenue needed
- Number of customers needed
- Timeline to break-even

### 5. Unit Economics

**Customer Acquisition**:
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- LTV:CAC ratio (target: >3)
- Payback period (target: <12 months)

**Per-Transaction Economics**:
- Average order value
- Gross profit per order
- Contribution margin

### 6. Scenario Modeling

**Best Case** (30% probability):
- Higher than expected growth
- Lower costs
- Assumptions

**Base Case** (50% probability):
- Realistic expectations
- Moderate growth
- Assumptions

**Worst Case** (20% probability):
- Slower growth
- Higher costs
- Assumptions

### 7. Cash Flow Projections

**Operating Cash Flow**:
- Cash from operations
- Working capital needs
- Seasonality factors

**Investment Cash Flow**:
- Capital expenditures
- Asset purchases

**Financing Cash Flow**:
- Funding rounds
- Debt servicing
- Equity dilution

### 8. Investment Requirements

**Funding Needed**:
- Initial investment
- Follow-on rounds
- Use of funds breakdown

**Sources of Capital**:
- Bootstrapping
- Angel/VC funding
- Debt financing
- Revenue financing

# Output Format
Provide structured JSON:
{
  "revenueProjections": {
    "assumptions": {
      "marketSize": "₹5000 Cr",
      "marketGrowth": "15% CAGR",
      "targetMarketShare": "2% by Year 5",
      "customerAcquisition": "10K customers Year 1, 50% growth"
    },
    "projections": [
      {
        "year": 1,
        "revenue": 10000000,
        "customers": 10000,
        "aov": 1000,
        "purchaseFrequency": 1.0,
        "growth": "baseline"
      },
      {
        "year": 2,
        "revenue": 18000000,
        "customers": 15000,
        "aov": 1200,
        "purchaseFrequency": 1.0,
        "growth": "80%"
      }
    ]
  },
  "costStructure": {
    "fixedCosts": {
      "salaries": 3000000,
      "rent": 500000,
      "technology": 1000000,
      "total": 4500000
    },
    "variableCosts": {
      "cogs": { "percentage": 40, "amount": 4000000 },
      "marketing": { "percentage": 20, "amount": 2000000 },
      "logistics": { "percentage": 10, "amount": 1000000 }
    }
  },
  "profitability": {
    "byYear": [
      {
        "year": 1,
        "revenue": 10000000,
        "grossProfit": 6000000,
        "grossMargin": "60%",
        "operatingProfit": -500000,
        "operatingMargin": "-5%",
        "netProfit": -500000,
        "netMargin": "-5%"
      }
    ],
    "breakEvenMonth": 18,
    "profitableYear": 2
  },
  "breakEvenAnalysis": {
    "fixedCosts": 4500000,
    "contributionMargin": 600,
    "breakEvenUnits": 7500,
    "breakEvenRevenue": 7500000,
    "currentRunRate": 10000000,
    "monthsToBreakEven": 18
  },
  "unitEconomics": {
    "cac": 200,
    "ltv": 800,
    "ltvCacRatio": 4.0,
    "paybackMonths": 6,
    "aov": 1000,
    "grossProfitPerOrder": 600,
    "contributionMargin": "60%"
  },
  "scenarios": {
    "best": {
      "probability": 0.30,
      "year3Revenue": 50000000,
      "assumptions": ["30% higher growth", "15% lower CAC"],
      "triggers": ["Viral growth", "Strategic partnerships"]
    },
    "base": {
      "probability": 0.50,
      "year3Revenue": 35000000,
      "assumptions": ["Plan growth rates", "Expected costs"]
    },
    "worst": {
      "probability": 0.20,
      "year3Revenue": 20000000,
      "assumptions": ["50% of planned growth", "20% higher costs"],
      "risks": ["Market slowdown", "Increased competition"]
    }
  },
  "cashFlow": {
    "year1": {
      "operatingCashFlow": -500000,
      "investmentCashFlow": -2000000,
      "financingCashFlow": 5000000,
      "netCashFlow": 2500000
    }
  },
  "investmentRequirements": {
    "totalNeeded": 5000000,
    "useOfFunds": {
      "productDevelopment": 1500000,
      "marketing": 2000000,
      "operations": 1000000,
      "workingCapital": 500000
    },
    "fundingSources": ["Seed round", "Angel investors"],
    "runway": "18 months"
  },
  "confidence": 0.75
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
