import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Pricing Intelligence Agent
 *
 * Analyzes pricing strategies and market pricing dynamics:
 * - Competitor pricing analysis
 * - Price positioning recommendations
 * - Pricing model evaluation
 * - Price elasticity insights
 * - Value-based pricing opportunities
 * - Pricing psychology and perception
 *
 * Outputs comprehensive pricing strategy recommendations
 */
export class PricingIntelligenceAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a pricing strategy expert. Your role is to:
1. Analyze competitive pricing landscapes
2. Evaluate pricing models and strategies
3. Assess price positioning opportunities
4. Recommend optimal pricing approaches
5. Identify pricing psychology factors
6. Quantify value-based pricing potential

Return structured, data-driven pricing recommendations.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Develop comprehensive pricing intelligence and strategy for this brand.

## Pricing Intelligence Framework

### 1. Competitive Pricing Analysis

**Price Mapping**:
For each competitor, analyze:
- Base pricing
- Promotional pricing
- Volume discounts
- Premium variants
- Entry-level options

**Pricing Tiers**:
- **Budget**: <₹500 ($6)
- **Value**: ₹500-1000 ($6-12)
- **Mid-Premium**: ₹1000-2500 ($12-30)
- **Premium**: ₹2500-5000 ($30-60)
- **Luxury**: >₹5000 ($60+)

**Price Distribution**:
- What % of competitors in each tier?
- Where is the market concentration?
- Where are the gaps?

### 2. Pricing Models Analysis

**Common Models**:

**Cost-Plus Pricing**:
- Cost + Fixed Markup
- Pros: Simple, ensures margin
- Cons: Ignores customer value

**Competitive Pricing**:
- Match or undercut competitors
- Pros: Market-aligned
- Cons: Price wars risk

**Value-Based Pricing**:
- Price based on customer value
- Pros: Maximizes profit
- Cons: Requires deep insight

**Penetration Pricing**:
- Low initial price to gain share
- Pros: Quick adoption
- Cons: Hard to raise later

**Skimming Pricing**:
- High initial price
- Pros: Maximizes early revenue
- Cons: Limits market size

**Freemium**:
- Free basic + paid premium
- Pros: Wide adoption
- Cons: Conversion challenges

**Subscription**:
- Recurring payments
- Pros: Predictable revenue
- Cons: Churn management

### 3. Price Positioning Strategy

**Positioning Options**:

**Premium Positioning**:
- High price signals quality
- Justification: Superior features/brand
- Target: Quality-conscious customers

**Value Positioning**:
- Fair price for good quality
- Justification: Efficiency, no frills
- Target: Value-seeking customers

**Budget Positioning**:
- Low price as main driver
- Justification: Scale, efficiency
- Target: Price-sensitive customers

**Recommended Position**:
Based on brand analysis, which works best?

### 4. Pricing Psychology

**Psychological Factors**:

**Price Anchoring**:
- Show premium option first
- Makes other prices seem reasonable

**Charm Pricing**:
- ₹999 vs ₹1000
- Perceived as "less than 1000"

**Prestige Pricing**:
- Round numbers (₹2000)
- Signals quality

**Bundle Pricing**:
- Package deals
- Increases perceived value

**Decoy Pricing**:
- Middle option appears best value
- Example: Small (₹300), Medium (₹450), Large (₹500)

### 5. Value-Based Pricing Opportunities

**Value Calculation**:
- Customer's willingness to pay
- Value delivered vs. alternatives
- Emotional value premium

**Value Drivers**:
- Time saved
- Quality improvement
- Convenience factor
- Status/identity value
- Peace of mind

**Premium Justification**:
What allows charging more?

### 6. Pricing Testing & Optimization

**Test Approaches**:
- A/B testing different price points
- Conjoint analysis for features
- Van Westendorp sensitivity
- Gabor-Granger method

**Metrics to Track**:
- Conversion rate by price
- Revenue per customer
- Customer lifetime value
- Price elasticity

# Output Format
Provide structured JSON:
{
  "competitivePricing": {
    "competitors": [
      {
        "name": "Competitor A",
        "priceRange": { "min": 800, "max": 2500 },
        "averagePrice": 1500,
        "tier": "mid-premium",
        "pricingModel": "value-based"
      }
    ],
    "marketDistribution": {
      "budget": "20%",
      "value": "35%",
      "midPremium": "30%",
      "premium": "10%",
      "luxury": "5%"
    },
    "priceGaps": [
      {
        "tier": "affordable-premium",
        "range": { "min": 1200, "max": 1800 },
        "opportunity": "Large gap between value and mid-premium"
      }
    ]
  },
  "recommendedPricing": {
    "model": "value-based",
    "position": "affordable-premium",
    "priceRange": { "min": 1299, "max": 1999 },
    "recommendedPrice": 1499,
    "rationale": "Sweet spot between value and premium segments",
    "marginTarget": "40%"
  },
  "pricingStrategy": {
    "approach": "Value-based with psychological pricing",
    "tactics": [
      "Use ₹1499 instead of ₹1500 (charm pricing)",
      "Anchor with premium variant at ₹2499",
      "Bundle offers for perceived value"
    ],
    "promotionalStrategy": {
      "launchDiscount": "15% off for first 1000 customers",
      "loyaltyPricing": "10% off for repeat customers",
      "volumeDiscounts": "Buy 3, save 20%"
    }
  },
  "valueJustification": {
    "customerValue": "₹3000 (time saved + quality)",
    "competitorPrice": "₹2000",
    "ourPrice": "₹1499",
    "valueProposition": "Superior value at 25% less than competitors",
    "premiumJustifiers": [
      "Sustainable materials",
      "Superior craftsmanship",
      "Hassle-free returns"
    ]
  },
  "pricingPsychology": {
    "primaryTechnique": "charm_pricing",
    "secondaryTechniques": ["anchoring", "bundling"],
    "decoyStructure": {
      "basic": 999,
      "standard": 1499,
      "premium": 1999
    }
  },
  "testingPlan": {
    "pricePoints": [1399, 1499, 1599],
    "metrics": ["conversion_rate", "revenue", "cltv"],
    "duration": "4 weeks",
    "expectedOptimal": 1499
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
        // Fallback: create basic pricing intelligence structure
        data = {
          competitivePricing: {
            competitors: [],
            marketDistribution: {},
            priceGaps: []
          },
          recommendedPricing: {
            model: 'To be determined',
            position: 'To be determined',
            recommendedPrice: 0,
            rationale: 'Requires competitive pricing data'
          },
          pricingStrategy: {
            approach: 'To be developed',
            tactics: []
          },
          valueJustification: {
            valueProposition: 'To be defined'
          },
          pricingPsychology: {
            primaryTechnique: 'To be selected'
          },
          testingPlan: {
            pricePoints: [],
            metrics: []
          },
          confidence: 0.65,
          note: 'Basic pricing framework - needs competitive pricing data'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.75,
        sources: ['pricing_intelligence']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse pricing intelligence response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
