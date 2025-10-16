import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Review Analysis Agent
 * Analyzes customer reviews to extract pain points, sentiment, and insights
 */
export class ReviewAnalysisAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a customer insights analyst specializing in review analysis and sentiment extraction.

Your role is to analyze customer reviews and extract:
- Key pain points and friction areas
- Positive sentiment drivers (what customers love)
- Feature requests and improvement opportunities
- Emotional triggers and language patterns
- Sentiment scoring
- Customer segment insights

Provide quantitative metrics and qualitative insights.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Analyze customer reviews for ${input.context.brandName} and extract comprehensive insights.

If review data is available in previous outputs, use it. Otherwise, provide guidance on:
- What review sources to analyze (website, Amazon, Google, social media)
- What specific insights would be most valuable
- How to structure the analysis

# Analysis Framework

1. **Sentiment Analysis**
   - Overall sentiment score (-1 to +1)
   - Distribution of positive, neutral, negative reviews
   - Sentiment trends over time

2. **Pain Points** (Top 5)
   - Specific customer complaints
   - Frequency and severity
   - Customer segments affected

3. **Delight Factors** (Top 5)
   - What customers love most
   - Specific praise patterns
   - Emotional language used

4. **Feature Requests**
   - Most requested improvements
   - Unmet needs

5. **Language Patterns**
   - Common phrases customers use
   - Emotional triggers (trust, quality, value, status)
   - Brand perception words

# Output Format
{
  "overallSentiment": 0.65,
  "reviewCount": 261,
  "distribution": {
    "positive": 185,
    "neutral": 50,
    "negative": 26
  },
  "painPoints": [
    {
      "issue": "...",
      "frequency": 45,
      "severity": "high|medium|low",
      "affectedSegments": ["..."]
    }
  ],
  "delightFactors": [
    {
      "factor": "...",
      "frequency": 120,
      "emotionalTrigger": "..."
    }
  ],
  "featureRequests": ["..."],
  "languagePatterns": {
    "commonPhrases": ["..."],
    "emotionalTriggers": ["trust", "quality", "..."],
    "brandPerceptionWords": ["premium", "reliable", "..."]
  },
  "confidence": 0.85,
  "sources": ["..."]
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 8000,
      temperature: 0.3
    });

    try {
      // Extract JSON more carefully - find the first complete JSON object
      const content = response.content.trim();
      let jsonStr = '';

      // Find first { and try to parse balanced JSON
      const startIdx = content.indexOf('{');
      if (startIdx === -1) {
        throw new Error('No JSON object found in response');
      }

      let braceCount = 0;
      for (let i = startIdx; i < content.length; i++) {
        const char = content[i];
        jsonStr += char;
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount === 0) break;
      }

      const data = JSON.parse(jsonStr);

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: data.confidence || 0.7,
        sources: data.sources || []
      };
    } catch (error) {
      throw new Error(`Failed to parse review analysis response: ${(error as Error).message}`);
    }
  }
}
