import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Competitor Research Agent
 * Researches competitors and analyzes their positioning, pricing, and strategies
 */
export class CompetitorResearchAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);

    const systemPrompt = `You are a competitive intelligence analyst specializing in brand positioning and market analysis.

Your role is to research competitors and provide comprehensive competitive intelligence including:
- Competitive positioning analysis
- Pricing strategies
- Brand messaging and tone
- Unique value propositions
- Market gaps and white spaces
- Strengths and weaknesses

Provide data-driven insights with confidence scores and sources.`;

    const userPrompt = `${brandContext}

# Task
Research the following competitors and provide comprehensive competitive intelligence:
${input.context.competitors.join(', ')}

For each competitor, analyze:
1. **Positioning**: How do they position themselves in the market?
2. **Target Audience**: Who are they targeting?
3. **Pricing Strategy**: Premium, mid-market, or budget?
4. **Key Differentiators**: What makes them unique?
5. **Brand Messaging**: Tone, key messages, value props
6. **Strengths & Weaknesses**: Where do they excel? Where are gaps?

Also identify:
- **Market Gaps**: Unserved customer needs or positioning white spaces
- **Opportunities**: Where can ${input.context.brandName} differentiate?

# Output Format
Provide a structured JSON response with:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "positioning": "...",
      "targetAudience": "...",
      "pricingStrategy": "premium|mid-market|budget",
      "keyDifferentiators": ["..."],
      "brandMessaging": {
        "tone": "...",
        "keyMessages": ["..."],
        "valuePropositions": ["..."]
      },
      "strengths": ["..."],
      "weaknesses": ["..."]
    }
  ],
  "marketGaps": ["..."],
  "opportunities": ["..."],
  "confidence": 0.85,
  "sources": ["..."]
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 8000,
      temperature: 0.3
    });

    try {
      // Extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Could not parse response' };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: data.confidence || 0.7,
        sources: data.sources || []
      };
    } catch (error) {
      throw new Error(`Failed to parse competitor research response: ${(error as Error).message}`);
    }
  }
}
