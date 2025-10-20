import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { default as pdfParse } from 'pdf-parse';

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
    let totalTokensUsed = 0;

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

        // Step 1: Extract actual text from PDF using pdf-parse
        const pdfBuffer = readFileSync(pdfPath);
        const pdfData = await pdfParse(pdfBuffer);

        // Validate we got text
        if (!pdfData.text || pdfData.text.trim().length === 0) {
          extractedDocuments.push({
            source: pdfSource.path,
            description: pdfSource.description,
            error: 'PDF contains no extractable text',
            extracted: false
          });
          continue;
        }

        // Step 2: Use Claude to structure the ACTUAL extracted text
        const systemPrompt = `You are a PDF extraction specialist. Your role is to:
1. Analyze REAL text extracted from PDF documents
2. Identify tables, financial data, product information
3. Structure the data in a clear, usable format
4. Preserve important context and relationships

CRITICAL: Only extract information that is ACTUALLY PRESENT in the provided text.
Do NOT fabricate or assume typical content. Return NULL for missing data.

Return structured JSON with extracted data.`;

        const userPrompt = `${brandContext}

# Task
Analyze the ACTUAL text extracted from this PDF and structure key information.

**PDF Source**: ${pdfSource.path}
**Description**: ${pdfSource.description || 'No description'}
**Page Count**: ${pdfData.numpages}
**Metadata**: ${JSON.stringify(pdfData.info || {})}

# ACTUAL EXTRACTED TEXT (from pdf-parse)
\`\`\`
${pdfData.text.substring(0, 50000)}
\`\`\`

${pdfData.text.length > 50000 ? '(Text truncated at 50k chars for token efficiency)\n' : ''}

# Output Format
Provide a structured JSON response with ONLY data found in the text above:
{
  "documentType": "investor_report|catalog|research|other",
  "extractedData": {
    "financials": { /* revenue, growth, etc - ONLY if present */ },
    "products": [ /* product list - ONLY if present */ ],
    "customers": { /* customer data - ONLY if present */ },
    "market": { /* market insights - ONLY if present */ },
    "keyInsights": [ /* important findings from text */ ]
  },
  "metadata": {
    "fileName": "${pdfSource.path}",
    "description": "${pdfSource.description}",
    "extractionDate": "${new Date().toISOString()}",
    "pageCount": ${pdfData.numpages},
    "textLength": ${pdfData.text.length}
  },
  "confidence": 0.XX
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
          data: extractedData,
          tokensUsed: response.tokensUsed
        });

        sources.push(pdfSource.path);
        totalTokensUsed += response.tokensUsed;

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
      tokensUsed: totalTokensUsed, // Actual token usage from API responses
      confidence: overallConfidence,
      sources
    };
  }
}
