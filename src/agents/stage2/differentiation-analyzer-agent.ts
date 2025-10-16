import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Differentiation Analyzer Agent
 *
 * Analyzes brand differentiation opportunities:
 * - Points of difference vs. competitors
 * - Points of parity (table stakes)
 * - Ownable territories
 * - Differentiation strength and credibility
 * - Sustainable competitive advantages
 *
 * Outputs differentiation strategy and proof points
 */
export class DifferentiationAnalyzerAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a brand differentiation strategist. Your role is to:
1. Identify points of difference and parity
2. Assess differentiation strength and credibility
3. Evaluate competitive advantages
4. Find ownable brand territories
5. Recommend differentiation strategy
6. Provide proof points for claims

Return structured, actionable differentiation analysis.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Analyze differentiation opportunities for this brand relative to competitors.

## Differentiation Analysis Framework

### 1. Points of Parity (POP)
Table stakes - features/benefits expected in the category:

**Identify**:
- Must-have features
- Expected quality levels
- Standard service elements
- Category norms

**Assessment**:
- Does the brand meet these?
- Any gaps to close?
- Cost of achieving parity?

### 2. Points of Difference (POD)
Differentiators - what makes the brand unique:

**Types of Differentiation**:
- **Product**: Features, quality, performance
- **Service**: Support, convenience, experience
- **Brand**: Values, personality, story
- **Price**: Cost advantage or premium justification
- **Channel**: Unique distribution or access

**POD Criteria**:
For each potential differentiator, evaluate:
- **Desirable**: Do customers want it? (1-10)
- **Deliverable**: Can we actually deliver it? (1-10)
- **Differentiating**: Is it unique vs. competitors? (1-10)
- **Defensible**: Can we sustain this advantage? (1-10)

**Overall POD Score** = Average of 4 criteria

### 3. Competitive Advantage Analysis

**Sustainable Advantages**:
- What can't competitors easily copy?
- What advantages compound over time?
- What's rooted in capabilities/assets?

**Advantage Types**:
- **Cost Advantage**: Lower cost structure
- **Differentiation Advantage**: Unique value
- **Focus Advantage**: Niche excellence
- **Scale Advantage**: Size benefits
- **Network Advantage**: Platform effects

### 4. Ownable Territories
Brand spaces that can be owned:

**Territory Types**:
- **Functional**: "The most reliable"
- **Emotional**: "The most caring"
- **Social**: "The most innovative"
- **Category**: "The expert in X"

**Ownership Criteria**:
- Authentic to brand
- Valued by customers
- Not owned by competitors
- Can be consistently delivered
- Can be communicated clearly

### 5. Differentiation Strategy

**Strategic Options**:

**Option 1: Be Different**
- Stand out with unique features/benefits
- Risk: May be niche
- Example: Tesla's technology focus

**Option 2: Be Better**
- Excel at what matters most
- Risk: Need proof and sustenance
- Example: Apple's design excellence

**Option 3: Be Cheaper**
- Compete on value/price
- Risk: Race to bottom
- Example: Walmart's everyday low prices

**Option 4: Be Focused**
- Own a specific niche deeply
- Risk: Limited growth
- Example: Lululemon's yoga focus

**Recommendation**: Which strategy fits best and why?

### 6. Proof Points

For each differentiation claim, provide evidence:
- **Claims**: What we say we are
- **Reasons to Believe**: Why it's credible
- **Proof Points**: Tangible evidence
- **Demonstrations**: How to show it

# Output Format
Provide structured JSON:
{
  "pointsOfParity": [
    {
      "feature": "Product quality",
      "categoryStandard": "Good quality expected",
      "brandStatus": "meets_standard",
      "gap": null,
      "priority": "maintain"
    }
  ],
  "pointsOfDifference": [
    {
      "differentiator": "Sustainable materials",
      "type": "product",
      "desirability": 8,
      "deliverability": 9,
      "differentiation": 7,
      "defensibility": 8,
      "overallScore": 8.0,
      "strength": "strong",
      "description": "100% eco-friendly materials",
      "proofPoints": [
        "Certified organic cotton",
        "Recycled packaging"
      ]
    }
  ],
  "competitiveAdvantages": [
    {
      "advantage": "Direct-to-consumer model",
      "type": "cost_advantage",
      "sustainability": "high",
      "description": "Lower costs by cutting middlemen",
      "defensibility": "Can be copied but requires infrastructure"
    }
  ],
  "ownableTerritories": [
    {
      "territory": "Affordable sustainability",
      "type": "functional_emotional",
      "ownership": 0.3,
      "potential": 0.8,
      "rationale": "Gap between premium eco-brands and mass market",
      "requirements": [
        "Consistently source sustainable materials",
        "Communicate sustainability story",
        "Maintain fair pricing"
      ]
    }
  ],
  "differentiationStrategy": {
    "recommendedApproach": "Be Different",
    "primaryDifferentiators": [
      "Sustainable materials at accessible prices",
      "Transparent supply chain"
    ],
    "secondaryDifferentiators": [
      "Community-driven design",
      "Circular economy model"
    ],
    "rationale": "Clear white space for accessible sustainability",
    "risks": [
      "Greenwashing perceptions",
      "Price pressure from competitors"
    ],
    "timeline": "12-18 months to establish"
  },
  "proofPointsMatrix": {
    "claim": "Most sustainable in category",
    "reasonsToBelieve": [
      "100% certified materials",
      "Carbon-neutral operations"
    ],
    "proofPoints": [
      "Third-party certifications",
      "Transparent impact reports"
    ],
    "demonstrations": [
      "Factory tours",
      "Supply chain tracking app"
    ]
  },
  "confidence": 0.85
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
        // Fallback: create basic differentiation analysis
        data = {
          pointsOfParity: [],
          pointsOfDifference: [],
          competitiveAdvantages: [],
          ownableTerritories: [],
          differentiationStrategy: {
            recommendedApproach: 'To be determined',
            primaryDifferentiators: [],
            rationale: 'Requires deeper competitive analysis'
          },
          proofPointsMatrix: {
            claim: 'To be determined',
            reasonsToBelieve: [],
            proofPoints: []
          },
          confidence: 0.65,
          note: 'Basic differentiation framework - needs competitive intelligence'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.8,
        sources: ['differentiation_analyzer']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse differentiation analyzer response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
