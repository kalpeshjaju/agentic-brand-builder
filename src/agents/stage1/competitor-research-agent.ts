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

    const systemPrompt = 'You are a competitive intelligence analyst specializing in brand positioning ' +
      'and market analysis.' + `

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

IMPORTANT: Provide a CONCISE analysis. Keep competitor descriptions brief (2-3 sentences max per field).

For each competitor, analyze:
1. **Positioning**: How do they position themselves? (1-2 sentences)
2. **Target Audience**: Who are they targeting? (1 sentence)
3. **Pricing Strategy**: Premium, mid-market, or budget?
4. **Key Differentiators**: Top 1-2 unique features (brief bullets)
5. **Brand Messaging**: Core tone & 1-2 key messages
6. **Strengths & Weaknesses**: Top 2 each (brief bullets)

Also identify (brief, 3-5 items total):
- **Market Gaps**: Key unserved needs
- **Opportunities**: Top differentiation opportunities for ${input.context.brandName}

# Output Format
Provide a COMPACT, VALID JSON response with:
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
      // Try multiple parsing strategies
      const content = response.content.trim();
      let data: unknown;

      // Strategy 1: Try balanced brace counting
      try {
        const startIdx = content.indexOf('{');
        if (startIdx !== -1) {
          let jsonStr = '';
          let braceCount = 0;
          for (let i = startIdx; i < content.length; i++) {
            const char = content[i];
            jsonStr += char;
            if (char === '{') {
              braceCount++;
            }
            if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                data = JSON.parse(jsonStr);
                break;
              }
            }
          }
        }
      } catch {
        // Strategy 1 failed, try strategy 2
      }

      // Strategy 2: If parsing failed, return simplified placeholder data
      if (!data) {
        data = {
          competitors: input.context.competitors.map((comp: string) => ({
            name: comp,
            positioning: 'Placeholder - competitor analysis data',
            targetAudience: 'Analysis not available',
            pricingStrategy: 'unknown',
            keyDifferentiators: ['Placeholder data'],
            brandMessaging: { tone: 'Unknown', keyMessages: [], valuePropositions: [] },
            strengths: ['Data not available'],
            weaknesses: ['Data not available']
          })),
          marketGaps: ['Full analysis encountered parsing issues - use placeholder data'],
          opportunities: ['Recommend manual competitive research'],
          confidence: 0.3,
          sources: ['partial_analysis'],
          note: 'JSON parsing failed - placeholder data returned'
        };
      }

      // Type assertion - we know data structure from either Claude or placeholder
      const typedData = data as { confidence?: number; sources?: string[] };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.7,
        sources: typedData.sources || []
      };
    } catch (error) {
      throw new Error(`Failed to parse competitor research response: ${(error as Error).message}`);
    }
  }
}
