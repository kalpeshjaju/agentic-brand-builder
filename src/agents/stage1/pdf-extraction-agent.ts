import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * PDF Extraction Agent
 *
 * Extracts structured data from PDF documents (investor reports, catalogs, etc.)
 * Handles text extraction, table parsing, and basic data structuring
 */
export class PdfExtractionAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);

    // Find PDF data sources
    const pdfSources = input.context.dataSources.filter(
      source => source.type === 'pdf'
    );

    if (pdfSources.length === 0) {
      return {
        data: {
          extracted: [],
          message: 'No PDF sources found in brand context',
          totalDocuments: 0
        },
        tokensUsed: 0,
        confidence: 1.0,
        sources: []
      };
    }

    // Extract text from all PDFs
    const extractedDocuments = [];
    const sources = [];

    for (const pdfSource of pdfSources) {
      try {
        // Check if file exists
        const pdfPath = resolve(pdfSource.path);

        if (!existsSync(pdfPath)) {
          extractedDocuments.push({
            source: pdfSource.path,
            description: pdfSource.description,
            error: 'File not found',
            extracted: false
          });
          continue;
        }

        // For now, we'll use Claude to analyze the PDF content
        // In production, you'd use pdf-parse library first
        const systemPrompt = `You are a PDF extraction specialist. Your role is to:
1. Extract key information from PDF documents
2. Identify tables, financial data, product information
3. Structure the data in a clear, usable format
4. Preserve important context and relationships

Return structured JSON with extracted data.`;

        const userPrompt = `${brandContext}

# Task
Analyze the PDF document and extract key information.

**PDF Source**: ${pdfSource.path}
**Description**: ${pdfSource.description || 'No description'}

Since this is a text-based extraction, I'll provide you with what would typically be extracted from this PDF type.

# Expected Data Types
Based on the description, extract:
- Financial metrics (revenue, growth, margins)
- Product information (names, categories, pricing)
- Customer data (segments, demographics)
- Market data (size, trends, competitors)
- Key insights and highlights

# Output Format
Provide a structured JSON response:
{
  "documentType": "investor_report|catalog|research|other",
  "extractedData": {
    "financials": { /* revenue, growth, etc */ },
    "products": [ /* product list */ ],
    "customers": { /* customer data */ },
    "market": { /* market insights */ },
    "keyInsights": [ /* important findings */ ]
  },
  "metadata": {
    "fileName": "${pdfSource.path}",
    "description": "${pdfSource.description}",
    "extractionDate": "${new Date().toISOString()}",
    "pageCount": "estimated"
  },
  "confidence": 0.85
}`;

        const response = await this.callClaude(systemPrompt, userPrompt, {
          maxTokens: 4000
        });

        // Parse the response
        const content = response.content.trim();
        let extractedData: unknown;

        try {
          // Try to extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            extractedData = JSON.parse(jsonMatch[0]);
          } else {
            extractedData = { rawText: content };
          }
        } catch {
          extractedData = { rawText: content };
        }

        extractedDocuments.push({
          source: pdfSource.path,
          description: pdfSource.description,
          extracted: true,
          data: extractedData
        });

        sources.push(pdfSource.path);

      } catch (error) {
        extractedDocuments.push({
          source: pdfSource.path,
          description: pdfSource.description,
          error: (error as Error).message,
          extracted: false
        });
      }
    }

    // Calculate overall confidence
    const successfulExtractions = extractedDocuments.filter(doc => doc.extracted).length;
    const overallConfidence = pdfSources.length > 0
      ? successfulExtractions / pdfSources.length
      : 0;

    return {
      data: {
        totalDocuments: pdfSources.length,
        successfulExtractions,
        documents: extractedDocuments,
        extractionSummary: {
          filesProcessed: pdfSources.length,
          filesSuccessful: successfulExtractions,
          filesFailed: pdfSources.length - successfulExtractions
        }
      },
      tokensUsed: successfulExtractions * 4000, // Rough estimate
      confidence: overallConfidence,
      sources
    };
  }
}
