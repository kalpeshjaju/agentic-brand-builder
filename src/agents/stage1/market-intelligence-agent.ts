import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Market Intelligence Agent
 *
 * Analyzes market dynamics, trends, and opportunities:
 * - Market size and growth rates
 * - Industry trends and disruptions
 * - Regulatory environment
 * - Technology shifts
 * - Consumer behavior changes
 * - Competitive dynamics
 *
 * Outputs comprehensive market intelligence report
 */
export class MarketIntelligenceAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a market intelligence analyst. Your role is to:
1. Analyze market size, growth, and trends
2. Identify key drivers and barriers
3. Assess competitive dynamics
4. Evaluate regulatory and technology impacts
5. Synthesize actionable insights
6. Quantify opportunities and risks

Return structured, evidence-based market intelligence.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Provide comprehensive market intelligence analysis for this brand's category and market.

## Market Intelligence Framework

### 1. Market Overview
**Market Size & Growth**:
- Total Addressable Market (TAM)
- Serviceable Available Market (SAM)
- Serviceable Obtainable Market (SOM)
- Historical growth rates (3-5 years)
- Projected growth rates (3-5 years)
- Market maturity stage

**Market Segmentation**:
- Key market segments by size
- Growth rates by segment
- Profitability by segment
- Accessibility by segment

### 2. Industry Trends
**Macro Trends**:
- Economic factors (GDP, inflation, spending)
- Demographic shifts (age, urbanization, income)
- Social trends (values, lifestyle changes)
- Technology disruptions (digital, AI, automation)
- Environmental concerns (sustainability, climate)

**Category-Specific Trends**:
- Product innovation trends
- Channel evolution (online vs. offline)
- Pricing dynamics
- Customer behavior shifts
- New business models

### 3. Competitive Dynamics
**Market Structure**:
- Market concentration (fragmented vs. consolidated)
- Number of major players
- Barriers to entry (high/medium/low)
- Switching costs for customers
- Bargaining power (suppliers, buyers)

**Competitive Forces**:
- Intensity of rivalry
- Threat of new entrants
- Threat of substitutes
- Supplier power
- Buyer power

### 4. Regulatory & Policy Environment
**Current Regulations**:
- Industry-specific regulations
- Quality and safety standards
- Labeling and advertising rules
- Trade policies and tariffs

**Regulatory Trends**:
- Upcoming policy changes
- Compliance requirements
- Industry self-regulation
- Government initiatives

### 5. Technology Landscape
**Current Technology**:
- Production technologies
- Distribution technologies
- Marketing technologies
- Customer service technologies

**Emerging Technologies**:
- AI and automation
- E-commerce and digital platforms
- Supply chain innovations
- Sustainable technologies

### 6. Opportunities & Threats
**Market Opportunities**:
- Underserved segments
- Emerging trends to leverage
- White space in positioning
- Channel opportunities
- Geographic expansion

**Market Threats**:
- Competitive threats
- Disruptive technologies
- Regulatory risks
- Economic risks
- Supply chain vulnerabilities

### 7. Strategic Implications
Based on market analysis:
- Where should the brand focus?
- What positioning would work?
- Which segments to prioritize?
- What timing is right?
- What resources are needed?

# Output Format
Provide structured JSON:
{
  "marketOverview": {
    "marketSize": {
      "tam": "₹500 Cr ($60M)",
      "sam": "₹200 Cr ($24M)",
      "som": "₹50 Cr ($6M)",
      "period": "2024"
    },
    "growth": {
      "historicalCAGR": "15%",
      "projectedCAGR": "18%",
      "period": "2024-2029"
    },
    "maturityStage": "growth",
    "segmentation": [
      {
        "segment": "Premium",
        "size": "₹100 Cr",
        "growth": "20%",
        "profitability": "high"
      }
    ]
  },
  "industryTrends": {
    "macroTrends": [
      {
        "trend": "Digital transformation",
        "impact": "high",
        "direction": "positive",
        "description": "Increasing online adoption"
      }
    ],
    "categoryTrends": [
      {
        "trend": "Sustainability focus",
        "impact": "medium",
        "direction": "positive",
        "description": "Consumers prefer eco-friendly products"
      }
    ]
  },
  "competitiveDynamics": {
    "marketStructure": {
      "concentration": "fragmented",
      "majorPlayers": 15,
      "marketShare": {
        "topPlayer": "12%",
        "top3": "28%",
        "top5": "40%"
      }
    },
    "competitiveForces": {
      "rivalryIntensity": "high",
      "entryBarriers": "medium",
      "substituteThreat": "medium",
      "supplierPower": "low",
      "buyerPower": "high"
    }
  },
  "regulatoryEnvironment": {
    "keyRegulations": [
      "Food safety standards",
      "Labeling requirements"
    ],
    "upcomingChanges": [
      "New e-commerce regulations"
    ],
    "complianceLevel": "moderate"
  },
  "technologyLandscape": {
    "current": [
      "E-commerce platforms",
      "Digital marketing"
    ],
    "emerging": [
      "AI personalization",
      "Blockchain for transparency"
    ],
    "adoptionLevel": "early majority"
  },
  "opportunities": [
    {
      "opportunity": "Underserved Tier 2/3 cities",
      "size": "₹80 Cr",
      "priority": "high",
      "timeframe": "0-12 months"
    }
  ],
  "threats": [
    {
      "threat": "Aggressive pricing by funded startups",
      "severity": "high",
      "probability": "high",
      "mitigation": "Focus on differentiation, not price"
    }
  ],
  "strategicImplications": {
    "keyInsights": [
      "Market is growing but fragmenting",
      "Digital channels critical for reach",
      "Sustainability increasingly important"
    ],
    "recommendations": [
      "Focus on Tier 2 cities for growth",
      "Build strong online presence",
      "Emphasize sustainable practices"
    ]
  },
  "confidence": 0.80
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 10000
    });

    try {
      // Parse response
      const content = response.content.trim();
      let data: unknown;

      // Try to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create basic market intelligence structure
        data = {
          marketOverview: {
            marketSize: {
              tam: 'To be determined',
              sam: 'To be determined',
              som: 'To be determined'
            },
            growth: {
              historicalCAGR: 'To be determined',
              projectedCAGR: 'To be determined'
            },
            maturityStage: 'growth'
          },
          industryTrends: {
            macroTrends: [],
            categoryTrends: []
          },
          competitiveDynamics: {
            marketStructure: {
              concentration: 'unknown',
              majorPlayers: 0
            }
          },
          opportunities: [],
          threats: [],
          strategicImplications: {
            keyInsights: [],
            recommendations: []
          },
          confidence: 0.6,
          note: 'Basic market analysis - more research needed for comprehensive intelligence'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence ?? 0.75,
        sources: ['market_intelligence']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse market intelligence response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
