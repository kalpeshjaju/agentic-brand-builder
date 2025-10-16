import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Positioning Strategy Agent
 * Creates strategic brand positioning based on all previous analysis
 */
export class PositioningStrategyAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a brand strategy consultant specializing in positioning and differentiation.

Your role is to create strategic brand positioning using frameworks like:
- Josh Lowman's Brand Positioning Framework
- Jobs-to-be-Done positioning
- Category design principles
- Competitive differentiation strategy

You synthesize all previous research to create:
- Clear positioning statement
- 3-5 positioning pillars with proof points
- Differentiation strategy
- Category ownership opportunities
- Messaging architecture foundation

Provide actionable, evidence-based positioning strategy.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Based on ALL previous research and analysis, create a comprehensive brand positioning strategy for ${input.context.brandName}.

# Framework: Josh Lowman Brand Positioning

1. **Positioning Statement**
   Format: "For [target customer] who [need/opportunity], [brand] is the [category] that [key benefit] because [reason to believe]."

2. **Positioning Pillars** (3-5 pillars)
   Each pillar should have:
   - Pillar name
   - Description
   - Proof points (evidence from research)
   - Competitive advantage

3. **Differentiation Strategy**
   - What makes this brand unique?
   - Unfair advantages (capabilities competitors can't easily copy)
   - Category ownership opportunity

4. **Target Customer Profile**
   - Primary segment (based on analysis)
   - Secondary segments
   - Customer lifetime value considerations

5. **Strategic Positioning Choices**
   - Price positioning (premium/mid/value)
   - Quality positioning
   - Emotional vs functional focus
   - Breadth vs depth strategy

# Output Format
{
  "positioningStatement": "...",
  "pillars": [
    {
      "name": "...",
      "description": "...",
      "proofPoints": ["..."],
      "competitiveAdvantage": "..."
    }
  ],
  "differentiation": {
    "uniqueValue": "...",
    "unfairAdvantages": ["..."],
    "categoryOwnership": "..."
  },
  "targetCustomer": {
    "primary": "...",
    "secondary": ["..."],
    "clvConsiderations": "..."
  },
  "strategicChoices": {
    "pricePositioning": "premium|mid-market|value",
    "qualityPositioning": "...",
    "emotionalVsFunctional": "...",
    "breadthVsDepth": "..."
  },
  "keyRecommendations": ["..."],
  "confidence": 0.85,
  "sources": ["previous analysis"]
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 8000,
      temperature: 0.4
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Could not parse response' };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: data.confidence || 0.8,
        sources: data.sources || ['synthesis of all previous analysis']
      };
    } catch (error) {
      throw new Error(`Failed to parse positioning strategy response: ${(error as Error).message}`);
    }
  }
}
