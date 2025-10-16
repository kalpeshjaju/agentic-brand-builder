import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Positioning Mapper Agent
 *
 * Maps competitive positioning landscape:
 * - Perceptual maps of brand positions
 * - Key positioning dimensions
 * - Competitor clustering
 * - White space identification
 * - Positioning strength analysis
 * - Repositioning opportunities
 *
 * Outputs visual positioning data and strategic recommendations
 */
export class PositioningMapperAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a brand positioning strategist. Your role is to:
1. Identify key positioning dimensions in the market
2. Map brands along these dimensions
3. Identify positioning clusters and gaps
4. Assess positioning strength and clarity
5. Recommend optimal positioning strategies
6. Provide data for visual perceptual maps

Return structured positioning analysis with coordinates for mapping.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Create a comprehensive competitive positioning map for this brand and its market.

## Positioning Mapping Framework

### 1. Positioning Dimensions
Identify 2-4 key dimensions that matter to customers:

**Common Dimensions**:
- **Price**: Premium vs. Value
- **Quality**: High vs. Basic
- **Innovation**: Cutting-edge vs. Traditional
- **Accessibility**: Niche vs. Mass Market
- **Service**: High-touch vs. Self-service
- **Sustainability**: Eco-friendly vs. Conventional
- **Convenience**: Easy vs. Complex
- **Customization**: Personalized vs. Standard

**Category-Specific Dimensions**:
Based on the brand's category, identify relevant positioning axes.

**Dimension Selection Criteria**:
- Important to customers
- Differentiating among competitors
- Actionable for the brand
- Easy to communicate

### 2. Brand Mapping
For each brand (target brand + competitors), determine position on each dimension:

**Scoring System**: 1-10 scale
- 1-3: Low/Basic/Value end
- 4-7: Middle ground
- 8-10: High/Premium/Advanced end

**Positioning Coordinates**:
For a 2D map, provide X,Y coordinates:
- X-axis: Primary dimension (e.g., Price)
- Y-axis: Secondary dimension (e.g., Quality)

Example:
- Brand A: { price: 3, quality: 8 } → Value-Premium positioning
- Brand B: { price: 8, quality: 9 } → Super-Premium positioning

### 3. Cluster Analysis
Identify positioning clusters:

**Cluster Types**:
- **Premium Cluster**: High price, high quality
- **Value Cluster**: Low price, acceptable quality
- **Mid-Market Cluster**: Moderate price/quality
- **Niche Clusters**: Unique positioning

**Cluster Characteristics**:
- Number of players in cluster
- Combined market share
- Growth rate
- Competitive intensity

### 4. White Space Identification
Find underserved positioning:

**Gap Analysis**:
- Physical gaps on perceptual map
- Customer needs not well served
- Emerging positioning opportunities
- Repositioning potential

**Opportunity Assessment**:
- Size of opportunity
- Difficulty to claim
- Defensibility
- Strategic fit

### 5. Positioning Strength Analysis
Evaluate positioning clarity and strength:

**Clarity Metrics**:
- How clear is the positioning?
- Is it differentiated?
- Is it credible?
- Is it consistent?

**Strength Metrics**:
- Market share in position
- Customer association strength
- Competitive advantage
- Positioning momentum

### 6. Strategic Recommendations
Based on mapping analysis:

**Positioning Options**:
1. **Reinforce**: Strengthen current position
2. **Reposition**: Move to different position
3. **Differentiate**: Create distinct sub-position
4. **Expand**: Extend to adjacent position

**Recommendations**:
- Optimal position for target brand
- Rationale for recommendation
- Required changes
- Risks and mitigations

# Output Format
Provide structured JSON:
{
  "positioningDimensions": [
    {
      "dimension": "Price",
      "lowLabel": "Value/Budget",
      "highLabel": "Premium/Luxury",
      "importance": 0.9,
      "rationale": "Price is primary purchase driver"
    },
    {
      "dimension": "Quality",
      "lowLabel": "Basic/Functional",
      "highLabel": "Superior/Exceptional",
      "importance": 0.85,
      "rationale": "Quality perception drives brand choice"
    }
  ],
  "brandPositions": [
    {
      "brandId": "target-brand",
      "brandName": "${input.context.brandName}",
      "isTarget": true,
      "position": {
        "price": 5,
        "quality": 7
      },
      "description": "Mid-price, above-average quality",
      "clarityScore": 0.7,
      "strengthScore": 0.6
    },
    {
      "brandId": "competitor-1",
      "brandName": "Competitor A",
      "isTarget": false,
      "position": {
        "price": 8,
        "quality": 9
      },
      "description": "Premium positioning",
      "marketShare": "15%"
    }
  ],
  "clusters": [
    {
      "clusterId": "premium",
      "clusterName": "Premium Cluster",
      "centerPosition": { "price": 8, "quality": 9 },
      "brands": ["competitor-1", "competitor-2"],
      "size": "30%",
      "intensity": "high",
      "growth": "15%"
    }
  ],
  "whiteSpaces": [
    {
      "spaceId": "affordable-premium",
      "spaceName": "Affordable Premium",
      "position": { "price": 6, "quality": 8 },
      "opportunity": "High quality at accessible price",
      "size": "₹100 Cr",
      "difficulty": "medium",
      "attractiveness": 8
    }
  ],
  "strategicRecommendations": {
    "recommendedPosition": {
      "target": { "price": 6, "quality": 8 },
      "positioning": "Affordable Premium",
      "rationale": "Large underserved segment seeking quality at fair price"
    },
    "keyMoves": [
      "Maintain quality standards",
      "Optimize cost structure for competitive pricing",
      "Communicate value-for-money clearly"
    ],
    "risks": [
      "May be perceived as neither fish nor fowl",
      "Requires operational excellence"
    ],
    "timeline": "6-12 months to establish position"
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
        // Fallback: create basic positioning map
        data = {
          positioningDimensions: [
            {
              dimension: 'Price',
              lowLabel: 'Value',
              highLabel: 'Premium',
              importance: 0.8
            },
            {
              dimension: 'Quality',
              lowLabel: 'Basic',
              highLabel: 'Superior',
              importance: 0.85
            }
          ],
          brandPositions: [
            {
              brandId: 'target-brand',
              brandName: input.context.brandName,
              isTarget: true,
              position: { price: 5, quality: 6 },
              description: 'Mid-market positioning'
            }
          ],
          clusters: [],
          whiteSpaces: [],
          strategicRecommendations: {
            recommendedPosition: {
              positioning: 'To be determined through research'
            },
            keyMoves: [],
            risks: []
          },
          confidence: 0.65,
          note: 'Basic positioning map - more competitive intelligence needed'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.75,
        sources: ['positioning_mapper']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse positioning mapper response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
