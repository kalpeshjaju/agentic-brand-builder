import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Entity Recognition Agent
 *
 * Identifies and extracts key entities from unstructured data:
 * - Brand names and sub-brands
 * - Product names and categories
 * - Key people (founders, executives, influencers)
 * - Locations (markets, stores, headquarters)
 * - Organizations (partners, suppliers, competitors)
 * - Dates and events (launches, milestones)
 *
 * Outputs structured entity data with relationships
 */
export class EntityRecognitionAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = 'You are an expert at Named Entity Recognition (NER) and' +
      ` information extraction. Your role is to:
1. Identify and extract key entities from text and data
2. Classify entities into appropriate categories
3. Establish relationships between entities
4. Resolve entity ambiguities and duplicates
5. Provide confidence scores for each extraction
6. Structure entity data for downstream analysis

Return structured, validated entity data.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Extract and structure all relevant entities from the brand context and previous analysis.

## Entity Categories

### 1. Brand & Product Entities
- **Brand Names**: Primary brand, sub-brands, brand variants
- **Product Names**: Individual products, product lines, SKUs
- **Product Categories**: Classification and taxonomy
- **Trademarks**: Registered marks, slogans, taglines

### 2. People & Organizations
- **Key People**: Founders, executives, board members
- **Influencers**: Brand ambassadors, advocates, critics
- **Customers**: Named customer segments or personas
- **Partners**: Strategic partners, suppliers, distributors
- **Investors**: Funding sources, major shareholders

### 3. Locations & Markets
- **Geographic Markets**: Countries, regions, cities
- **Physical Locations**: Stores, offices, manufacturing
- **Distribution Channels**: Online, retail, wholesale
- **Market Segments**: Geographic or demographic markets

### 4. Events & Milestones
- **Launch Dates**: Product launches, brand launches
- **Funding Rounds**: Investment events, valuations
- **Partnerships**: Strategic alliances, acquisitions
- **Achievements**: Awards, certifications, milestones

### 5. Financial & Metrics
- **Revenue Figures**: Current, historical, projected
- **Market Share**: Percentages, rankings
- **Customer Metrics**: User counts, retention rates
- **Valuation**: Company valuation, funding amounts

### 6. Competitor Entities
- **Direct Competitors**: Head-to-head competitors
- **Indirect Competitors**: Alternative solutions
- **Market Leaders**: Category leaders
- **Emerging Players**: New entrants

## Entity Relationships

Map connections between entities:
- **owns**: Brand owns Product
- **competes_with**: Brand competes with Competitor
- **located_in**: Brand located in Market
- **founded_by**: Brand founded by Person
- **partners_with**: Brand partners with Organization
- **launched_on**: Product launched on Date

## Entity Enrichment

For each entity, provide:
- **Confidence Score**: How certain are we? (0.0-1.0)
- **Source**: Where was this mentioned?
- **Context**: Relevant surrounding information
- **Aliases**: Alternative names or spellings
- **Disambiguation**: Clarification if ambiguous

# Output Format
Provide structured JSON:
{
  "entities": {
    "brands": [
      {
        "id": "brand-001",
        "name": "${input.context.brandName}",
        "type": "primary_brand",
        "aliases": [],
        "category": "${input.context.category}",
        "confidence": 1.0,
        "sources": ["brand_context"]
      }
    ],
    "products": [
      {
        "id": "product-001",
        "name": "Product Name",
        "category": "Product Category",
        "brandId": "brand-001",
        "confidence": 0.9,
        "sources": ["previous_analysis"]
      }
    ],
    "people": [
      {
        "id": "person-001",
        "name": "Founder Name",
        "role": "Founder & CEO",
        "brandId": "brand-001",
        "confidence": 0.85,
        "sources": ["pdf_extraction"]
      }
    ],
    "locations": [
      {
        "id": "location-001",
        "name": "India",
        "type": "market",
        "details": "Primary market",
        "confidence": 0.95,
        "sources": ["brand_context"]
      }
    ],
    "competitors": [
      {
        "id": "competitor-001",
        "name": "Competitor Name",
        "type": "direct",
        "category": "${input.context.category}",
        "confidence": 1.0,
        "sources": ["brand_context"]
      }
    ],
    "events": [
      {
        "id": "event-001",
        "type": "founding",
        "date": "2020-01-01",
        "description": "Company founded",
        "confidence": 0.8,
        "sources": ["pdf_extraction"]
      }
    ],
    "financials": [
      {
        "id": "financial-001",
        "type": "revenue",
        "value": "${input.context.currentRevenue || 'Not specified'}",
        "period": "current",
        "confidence": 0.9,
        "sources": ["brand_context"]
      }
    ]
  },
  "relationships": [
    {
      "source": "brand-001",
      "target": "product-001",
      "type": "owns",
      "confidence": 0.95
    },
    {
      "source": "brand-001",
      "target": "competitor-001",
      "type": "competes_with",
      "confidence": 0.9
    }
  ],
  "summary": {
    "totalEntities": 10,
    "entitiesByType": {
      "brands": 1,
      "products": 2,
      "people": 1,
      "locations": 1,
      "competitors": 3,
      "events": 1,
      "financials": 1
    },
    "highConfidenceEntities": 8,
    "needsVerification": 2
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
        // Fallback: create basic entity structure
        data = {
          entities: {
            brands: [
              {
                id: 'brand-001',
                name: input.context.brandName,
                type: 'primary_brand',
                category: input.context.category,
                confidence: 1.0
              }
            ],
            products: [],
            people: [],
            locations: [],
            competitors: input.context.competitors.map((comp, idx) => ({
              id: `competitor-${String(idx + 1).padStart(3, '0')}`,
              name: comp,
              type: 'direct',
              confidence: 1.0
            })),
            events: [],
            financials: []
          },
          relationships: [],
          summary: {
            totalEntities: 1 + input.context.competitors.length,
            entitiesByType: {
              brands: 1,
              competitors: input.context.competitors.length
            }
          },
          confidence: 0.7,
          note: 'Basic entity extraction - more data needed for comprehensive analysis'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.8,
        sources: ['entity_recognition']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse entity recognition response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
