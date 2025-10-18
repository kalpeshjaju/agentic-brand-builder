import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Market Overview Agent
 *
 * Analyzes market fundamentals:
 * - Market size (TAM, SAM, SOM)
 * - Growth rates and maturity
 * - Market segmentation
 * - Size of opportunity
 *
 * Outputs focused market sizing and segmentation
 */
export class MarketOverviewAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a market sizing expert. Your role is to:
1. Estimate market sizes (TAM, SAM, SOM)
2. Analyze growth rates and trends
3. Segment markets by key dimensions
4. Assess market maturity
5. Quantify opportunity size

Return structured, evidence-based market sizing.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Analyze market size and segmentation for this brand.

## Required Analysis

### 1. Market Sizing
- Total Addressable Market (TAM)
- Serviceable Available Market (SAM)
- Serviceable Obtainable Market (SOM)
- Market period and geography

### 2. Growth Analysis
- Historical growth (CAGR last 3-5 years)
- Projected growth (CAGR next 3-5 years)
- Growth drivers
- Market maturity stage

### 3. Market Segmentation
- Key segments by size
- Growth rate by segment
- Profitability by segment
- Accessibility/competition by segment

# Output Format
Return JSON:
{
  "marketSize": {
    "tam": "₹X Cr",
    "sam": "₹X Cr",
    "som": "₹X Cr",
    "period": "2024",
    "geography": "India"
  },
  "growth": {
    "historicalCAGR": "X%",
    "projectedCAGR": "X%",
    "period": "2024-2029",
    "drivers": ["Driver 1", "Driver 2"]
  },
  "maturityStage": "emerging|growth|mature|declining",
  "segmentation": [
    {
      "segment": "Premium",
      "size": "₹X Cr",
      "growth": "X%",
      "profitability": "high|medium|low",
      "competition": "high|medium|low"
    }
  ],
  "opportunitySize": {
    "totalMarket": "₹X Cr",
    "targetSegment": "₹X Cr",
    "realisticCapture": "₹X Cr (X%)"
  },
  "confidence": 0.75
}

Use realistic estimates for India. Be specific with numbers.`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 3000
    });

    try {
      const content = response.content.trim();
      let data: unknown;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        data = {
          marketSize: {
            tam: 'To be determined',
            sam: 'To be determined',
            som: 'To be determined',
            period: '2024'
          },
          growth: {
            historicalCAGR: 'To be determined',
            projectedCAGR: 'To be determined'
          },
          maturityStage: 'growth',
          segmentation: [],
          confidence: 0.60,
          note: 'Basic market sizing - needs detailed research'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.70,
        sources: ['market_overview']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse market overview response: ${(error as Error).message}`
      );
    }
  }
}
