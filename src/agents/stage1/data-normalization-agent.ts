import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Data Normalization Agent
 *
 * Cleans and standardizes data from various sources
 * - Normalizes currency formats (₹, $, €)
 * - Standardizes dates
 * - Cleans numerical data
 * - Harmonizes terminology
 */
export class DataNormalizationAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a data normalization specialist. Your role is to:
1. Standardize data formats across different sources
2. Convert currencies to a consistent format
3. Normalize dates to ISO 8601
4. Clean and validate numerical data
5. Harmonize terminology and naming conventions
6. Identify and flag data quality issues

Return structured, clean data ready for analysis.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Normalize and clean all data from previous stages.

## Normalization Tasks

### 1. Currency Normalization
- Convert all currencies to standard format
- Preserve original currency symbol
- Add normalized USD equivalent (if applicable)
- Example: "₹35 Cr" → { original: "₹35 Cr", normalized: 350000000, currency: "INR", usd: 4200000 }

### 2. Date Normalization
- Convert all dates to ISO 8601 format
- Handle various input formats
- Add readable format for display

### 3. Number Standardization
- Remove formatting (commas, spaces)
- Convert shorthand (Cr, K, M) to full numbers
- Validate ranges and reasonableness

### 4. Text Normalization
- Standardize product names
- Harmonize category names
- Clean special characters
- Fix encoding issues

### 5. Data Quality Checks
- Identify missing data
- Flag suspicious values
- Detect inconsistencies
- Suggest corrections

# Output Format
Provide structured JSON:
{
  "normalized": {
    "financials": {
      "currentRevenue": {
        "original": "₹35 Cr",
        "normalized": 350000000,
        "currency": "INR",
        "displayFormat": "₹35 Crore"
      },
      "targetRevenue": { /* same structure */ }
    },
    "dates": {
      /* normalized dates */
    },
    "products": [
      /* normalized product data */
    ],
    "competitors": [
      /* normalized competitor data */
    ]
  },
  "qualityIssues": [
    {
      "field": "fieldName",
      "issue": "description",
      "severity": "high|medium|low",
      "suggestion": "how to fix"
    }
  ],
  "transformations": {
    "totalFields": 0,
    "normalized": 0,
    "issues": 0
  },
  "confidence": 0.90
}`;

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
        // Fallback: create basic normalization result
        data = {
          normalized: {
            brandName: input.context.brandName,
            category: input.context.category
          },
          qualityIssues: [],
          transformations: {
            totalFields: 0,
            normalized: 0,
            issues: 0
          },
          confidence: 0.7,
          note: 'Partial normalization - full processing requires structured input'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.85,
        sources: ['data_normalization']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse normalization response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
