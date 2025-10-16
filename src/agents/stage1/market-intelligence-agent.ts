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
Provide market intelligence analysis for this brand's category and market.

## Required Analysis

### 1. Market Overview
- Market size: TAM, SAM, SOM
- Growth: Historical and projected CAGR
- Maturity stage
- Key segments by size, growth, profitability

### 2. Industry Trends
- Macro trends (economic, demographic, social, technology, environmental)
- Category trends (innovation, channels, pricing, customer behavior, business models)

### 3. Competitive Dynamics
- Market structure: concentration, number of players, barriers to entry
- Competitive forces: rivalry intensity, entry threats, substitutes, supplier/buyer power

### 4. Regulatory Environment
- Key regulations and standards
- Upcoming policy changes
- Compliance requirements

### 5. Technology Landscape
- Current technologies (production, distribution, marketing)
- Emerging technologies (AI, e-commerce, sustainability)

### 6. Opportunities & Threats
- Market opportunities: underserved segments, trends, white space, channels, geography
- Market threats: competition, disruption, regulation, economic, supply chain

### 7. Strategic Implications
- Where to focus, what positioning, which segments, timing, resources needed

# Output Format
Return JSON:
{
  "marketOverview": {
    "marketSize": { "tam": "₹X Cr", "sam": "₹X Cr", "som": "₹X Cr", "period": "2024" },
    "growth": { "historicalCAGR": "X%", "projectedCAGR": "X%", "period": "2024-2029" },
    "maturityStage": "growth|mature|emerging",
    "segmentation": [{ "segment": "Name", "size": "₹X Cr", "growth": "X%", "profitability": "high|medium|low" }]
  },
  "industryTrends": {
    "macroTrends": [{ "trend": "Name", "impact": "high|medium|low", "direction": "positive|negative", "description": "Brief" }],
    "categoryTrends": [{ "trend": "Name", "impact": "high|medium|low", "direction": "positive|negative", "description": "Brief" }]
  },
  "competitiveDynamics": {
    "marketStructure": { "concentration": "fragmented|consolidated", "majorPlayers": 0, "marketShare": { "topPlayer": "X%", "top3": "X%", "top5": "X%" } },
    "competitiveForces": { "rivalryIntensity": "high|medium|low", "entryBarriers": "high|medium|low", "substituteThreat": "high|medium|low", "supplierPower": "high|medium|low", "buyerPower": "high|medium|low" }
  },
  "regulatoryEnvironment": {
    "keyRegulations": ["List"],
    "upcomingChanges": ["List"],
    "complianceLevel": "high|moderate|low"
  },
  "technologyLandscape": {
    "current": ["List current tech"],
    "emerging": ["List emerging tech"],
    "adoptionLevel": "early|majority|late"
  },
  "opportunities": [{ "opportunity": "Description", "size": "₹X Cr", "priority": "high|medium|low", "timeframe": "X months" }],
  "threats": [{ "threat": "Description", "severity": "high|medium|low", "probability": "high|medium|low", "mitigation": "Strategy" }],
  "strategicImplications": {
    "keyInsights": ["List insights"],
    "recommendations": ["List recommendations"]
  },
  "confidence": 0.80
}

Focus on actionable insights. Use realistic market estimates for India.`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 6000
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
        confidence: typedData.confidence || 0.75,
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
