import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Strategic Document Writer Agent
 *
 * Synthesizes all previous analysis into comprehensive strategic documents:
 * - Executive summary
 * - Market analysis section
 * - Customer insights section
 * - Strategic recommendations
 * - Implementation roadmap
 * - Appendices with supporting data
 *
 * Outputs structured markdown content ready for HTML conversion
 */
export class StrategicDocumentWriterAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are an expert strategic document writer. Your role is to:
1. Synthesize complex analysis into clear, compelling narratives
2. Structure documents logically with clear hierarchy
3. Write in a professional yet accessible tone
4. Support claims with data and evidence
5. Create actionable recommendations
6. Format content in clean markdown

Return well-structured markdown content.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Write a comprehensive brand strategy document that synthesizes all previous analysis.

## Document Structure

### 1. Executive Summary (1-2 pages)
- **The Opportunity**: What's the market opportunity?
- **The Strategy**: What's our approach?
- **Key Insights**: Top 3-5 strategic insights
- **Recommended Actions**: Priority initiatives
- **Expected Outcomes**: What success looks like

### 2. Market Context (2-3 pages)
- **Market Overview**: Size, growth, trends
- **Competitive Landscape**: Key players and positioning
- **Market Dynamics**: Forces shaping the market
- **Opportunity Analysis**: Where gaps exist

### 3. Customer Intelligence (3-4 pages)
- **Segmentation Overview**: Key customer segments
- **Detailed Personas**: For each priority segment
- **Jobs-to-be-Done**: What customers are trying to accomplish
- **Pain Points & Gains**: Critical needs and desires
- **Customer Journey**: How they discover, evaluate, buy

### 4. Strategic Positioning (2-3 pages)
- **Brand Purpose & Promise**: Why we exist and what we commit to
- **Value Proposition**: Core value we deliver
- **Positioning Statement**: How we want to be perceived
- **Key Differentiators**: What sets us apart
- **Messaging Framework**: Core messages and proof points

### 5. Strategic Recommendations (3-4 pages)
- **Positioning Strategy**: How to position the brand
- **Product Strategy**: What to offer and emphasize
- **Pricing Strategy**: How to price for value
- **Channel Strategy**: Where and how to sell
- **Communication Strategy**: How to reach customers
- **Priority Initiatives**: Top 5-7 initiatives with rationale

### 6. Implementation Roadmap (2-3 pages)
- **Phase 1 (0-3 months)**: Quick wins and foundations
- **Phase 2 (3-6 months)**: Core initiatives
- **Phase 3 (6-12 months)**: Growth and scaling
- **Resource Requirements**: What's needed
- **Success Metrics**: How to measure progress
- **Risk Mitigation**: Potential challenges and solutions

### 7. Appendices
- **Data Tables**: Supporting quantitative data
- **Detailed Personas**: Full persona profiles
- **Competitive Analysis**: Detailed competitor breakdown
- **Methodology**: How analysis was conducted

## Writing Guidelines

**Tone**: Professional, confident, evidence-based
**Structure**: Clear headers, bullet points, short paragraphs
**Evidence**: Support all claims with data or reasoning
**Actionability**: Every section should lead to clear implications
**Clarity**: Avoid jargon, explain concepts simply

# Output Format
Provide structured JSON with markdown content:
{
  "document": {
    "title": "Brand Strategy Document: [Brand Name]",
    "subtitle": "Strategic Intelligence & Recommendations",
    "date": "2025-10-16",
    "sections": [
      {
        "id": "executive-summary",
        "title": "Executive Summary",
        "content": "# Executive Summary\\n\\n## The Opportunity\\n\\n[Markdown content]...",
        "pageCount": 2
      },
      {
        "id": "market-context",
        "title": "Market Context",
        "content": "# Market Context\\n\\n## Market Overview\\n\\n[Markdown content]...",
        "pageCount": 3
      },
      {
        "id": "customer-intelligence",
        "title": "Customer Intelligence",
        "content": "# Customer Intelligence\\n\\n## Segmentation Overview\\n\\n[Markdown content]...",
        "pageCount": 4
      },
      {
        "id": "strategic-positioning",
        "title": "Strategic Positioning",
        "content": "# Strategic Positioning\\n\\n## Brand Purpose & Promise\\n\\n[Markdown content]...",
        "pageCount": 3
      },
      {
        "id": "strategic-recommendations",
        "title": "Strategic Recommendations",
        "content": "# Strategic Recommendations\\n\\n## Positioning Strategy\\n\\n[Markdown content]...",
        "pageCount": 4
      },
      {
        "id": "implementation-roadmap",
        "title": "Implementation Roadmap",
        "content": "# Implementation Roadmap\\n\\n## Phase 1 (0-3 months)\\n\\n[Markdown content]...",
        "pageCount": 3
      }
    ],
    "metadata": {
      "totalPages": 19,
      "wordCount": 8500,
      "readingTime": "35 minutes"
    }
  },
  "confidence": 0.85
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 12000
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
        // Fallback: create basic document structure
        data = {
          document: {
            title: `Brand Strategy Document: ${input.context.brandName}`,
            subtitle: 'Strategic Intelligence & Recommendations',
            date: new Date().toISOString().split('T')[0],
            sections: [
              {
                id: 'executive-summary',
                title: 'Executive Summary',
                content: '# Executive Summary\n\nTo be completed with full analysis.',
                pageCount: 1
              }
            ],
            metadata: {
              totalPages: 1,
              wordCount: 100,
              readingTime: '1 minute'
            }
          },
          confidence: 0.6,
          note: 'Partial document - more analysis needed for complete strategy'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.8,
        sources: ['strategic_document_writer']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse document writer response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
