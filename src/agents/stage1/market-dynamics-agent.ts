import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Market Dynamics Agent
 *
 * Analyzes market forces and dynamics:
 * - Industry trends (macro + category)
 * - Competitive dynamics
 * - Regulatory and technology landscape
 * - Opportunities and threats
 *
 * Outputs market dynamics and strategic implications
 */
export class MarketDynamicsAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a market dynamics analyst. Your role is to:
1. Identify key industry trends
2. Analyze competitive forces
3. Assess regulatory and technology impacts
4. Spot opportunities and threats
5. Provide strategic implications

Return structured, actionable market insights.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Analyze market dynamics, trends, and competitive forces for this brand.

## Required Analysis

### 1. Industry Trends
- Top 3-5 macro trends (economic, demographic, social, tech, environmental)
- Top 3-5 category trends (innovation, channels, pricing, behavior)

### 2. Competitive Dynamics
- Market concentration (fragmented/consolidated)
- Competitive intensity (high/medium/low)
- Key competitive forces (Porter's 5 forces summary)

### 3. Regulatory & Technology
- Key regulations impacting category
- Emerging technologies affecting market

### 4. Opportunities & Threats
- Top 3-5 market opportunities (size, priority, timeframe)
- Top 3-5 market threats (severity, probability, mitigation)

### 5. Strategic Implications
- Key insights for this brand
- Recommended focus areas

# Output Format
Return JSON:
{
  "industryTrends": {
    "macro": [
      {
        "trend": "Digital transformation",
        "impact": "high",
        "direction": "positive",
        "implication": "Brief insight"
      }
    ],
    "category": [
      {
        "trend": "D2C growth",
        "impact": "high",
        "direction": "positive",
        "implication": "Brief insight"
      }
    ]
  },
  "competitiveDynamics": {
    "concentration": "fragmented|consolidated",
    "intensity": "high|medium|low",
    "forces": {
      "rivalry": "high|medium|low",
      "entryBarriers": "high|medium|low",
      "buyerPower": "high|medium|low"
    }
  },
  "regulatory": {
    "keyRegulations": ["Reg 1", "Reg 2"],
    "impact": "high|medium|low"
  },
  "technology": {
    "emerging": ["Tech 1", "Tech 2"],
    "adoptionStage": "early|growth|mature"
  },
  "opportunities": [
    {
      "opportunity": "Tier 2/3 cities underserved",
      "size": "₹X Cr",
      "priority": "high",
      "timeframe": "6-12 months"
    }
  ],
  "threats": [
    {
      "threat": "Funded competitors lowering prices",
      "severity": "high",
      "probability": "medium",
      "mitigation": "Focus on differentiation"
    }
  ],
  "strategicImplications": {
    "keyInsights": [
      "Market fragmenting - opportunity for consolidation",
      "D2C becoming critical channel"
    ],
    "focusAreas": [
      "Build online presence",
      "Target Tier 2 cities"
    ]
  },
  "confidence": 0.75
}

Be specific and actionable.`;

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
          industryTrends: {
            macro: [],
            category: []
          },
          competitiveDynamics: {
            concentration: 'unknown',
            intensity: 'medium'
          },
          opportunities: [],
          threats: [],
          strategicImplications: {
            keyInsights: [],
            focusAreas: []
          },
          confidence: 0.60,
          note: 'Basic dynamics analysis - needs market research'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.70,
        sources: ['market_dynamics']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse market dynamics response: ${(error as Error).message}`
      );
    }
  }
}
