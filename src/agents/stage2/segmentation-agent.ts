import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Segmentation Agent
 *
 * Identifies and defines customer segments based on:
 * - Demographic data
 * - Behavioral patterns
 * - Psychographic profiles
 * - Purchase behavior
 * - Market research data
 *
 * Outputs detailed segment personas with characteristics, needs, and pain points
 */
export class SegmentationAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a customer segmentation expert. Your role is to:
1. Analyze market data, customer information, and brand context
2. Identify distinct customer segments
3. Create detailed segment personas
4. Define segment characteristics, needs, and pain points
5. Prioritize segments by strategic importance
6. Map customer journey stages for each segment

Return structured, actionable segmentation analysis.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Identify and analyze customer segments for this brand.

## Segmentation Framework

### 1. Segment Identification
Identify 3-5 distinct customer segments based on:
- **Demographics**: Age, gender, income, location, occupation
- **Psychographics**: Values, lifestyle, attitudes, interests
- **Behavior**: Purchase patterns, brand interactions, channel preferences
- **Needs**: Functional needs, emotional needs, jobs-to-be-done

### 2. Segment Personas
For each segment, create a detailed persona:
- **Name**: Memorable persona name (e.g., "Budget-Conscious Millennial")
- **Demographics**: Detailed demographic profile
- **Psychographics**: Values, motivations, lifestyle
- **Behaviors**: Shopping habits, brand preferences, media consumption
- **Needs & Pain Points**: What problems do they need solved?
- **Goals & Aspirations**: What do they want to achieve?
- **Barriers**: What prevents them from purchasing?

### 3. Segment Prioritization
Rank segments by:
- **Market Size**: Total addressable market
- **Growth Potential**: Expected growth rate
- **Accessibility**: Ease of reaching this segment
- **Profitability**: Potential revenue and margins
- **Strategic Fit**: Alignment with brand capabilities

### 4. Customer Journey Mapping
For each segment, map key journey stages:
- **Awareness**: How do they discover brands?
- **Consideration**: What influences their decisions?
- **Purchase**: Where and how do they buy?
- **Experience**: What matters during usage?
- **Loyalty**: What drives repeat purchase?

# Output Format
Provide structured JSON:
{
  "segments": [
    {
      "id": "segment-1",
      "name": "Budget-Conscious Millennials",
      "priority": 1,
      "persona": {
        "demographics": {
          "ageRange": "25-35",
          "gender": "All genders",
          "income": "₹3-6 lakhs/year",
          "location": "Tier 1 & 2 cities",
          "occupation": "Young professionals, students"
        },
        "psychographics": {
          "values": ["Value for money", "Quality", "Convenience"],
          "lifestyle": "Digital-first, social media active",
          "attitudes": "Price-sensitive but quality-conscious"
        },
        "behaviors": {
          "purchaseFrequency": "Monthly",
          "channelPreference": "Online",
          "brandLoyalty": "Low - switches for better deals",
          "averageOrderValue": "₹500-1500"
        },
        "needsAndPainPoints": [
          "Need affordable quality products",
          "Pain: High prices of premium brands",
          "Pain: Difficulty finding value-for-money options"
        ],
        "goalsAndAspirations": [
          "Live well within budget",
          "Make smart purchasing decisions",
          "Access quality without overpaying"
        ],
        "barriers": [
          "Limited disposable income",
          "Trust concerns with unknown brands",
          "Delivery and return hassles"
        ]
      },
      "marketMetrics": {
        "size": "Estimated 15-20 million",
        "growthRate": "15-20% annually",
        "accessibility": "high",
        "profitability": "medium"
      },
      "customerJourney": {
        "awareness": "Social media, influencers, online search",
        "consideration": "Reviews, comparisons, peer recommendations",
        "purchase": "E-commerce platforms, brand website",
        "experience": "Product quality, delivery speed, packaging",
        "loyalty": "Discounts, loyalty programs, consistent quality"
      }
    }
    // ... more segments
  ],
  "segmentationInsights": {
    "primarySegment": "segment-1",
    "secondarySegment": "segment-2",
    "totalAddressableMarket": "50-60 million",
    "keyDifferentiators": [
      "Most segments value quality over price",
      "Strong preference for online channels",
      "High influence of social proof"
    ],
    "strategicRecommendations": [
      "Focus on budget-conscious and quality-seekers initially",
      "Build strong online presence and social proof",
      "Develop tiered pricing strategy for different segments"
    ]
  },
  "confidence": 0.85
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 8000
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
        // Fallback: create basic segmentation result
        data = {
          segments: [
            {
              id: 'segment-1',
              name: 'Primary Customer Segment',
              priority: 1,
              persona: {
                demographics: {
                  ageRange: 'To be determined',
                  gender: 'To be determined'
                }
              },
              marketMetrics: {
                size: 'To be determined',
                accessibility: 'medium'
              }
            }
          ],
          segmentationInsights: {
            primarySegment: 'segment-1',
            totalAddressableMarket: 'To be determined'
          },
          confidence: 0.6,
          note: 'Partial segmentation - more data needed for detailed analysis'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.8,
        sources: ['segmentation_analysis']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse segmentation response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
