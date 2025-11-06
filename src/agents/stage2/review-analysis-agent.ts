import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';
import { readTextFile } from '../../utils/read-text-file.js';
import { parseJson } from '../../utils/parse-json.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

    const systemPrompt = await readTextFile(
      resolve(__dirname, 'prompts/review-analysis-system.txt')
    );

    const userPromptTemplate = await readTextFile(
      resolve(__dirname, 'prompts/review-analysis-user.txt')
    );

    const userPrompt = userPromptTemplate
      .replace('{{brandContext}}', brandContext)
      .replace('{{previousOutputs}}', previousOutputs)
      .replace('{{brandName}}', input.context.brandName);

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 8000,
      temperature: 0.3,
    });

    try {
      const data = parseJson<{
        confidence?: number;
        sources?: string[];
      }>(response.content);

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: data.confidence || 0.7,
        sources: data.sources || [],
      };
    } catch (error) {
      throw new Error(
        `Failed to parse review analysis response: ${(error as Error).message}`
      );
    }
  }
}
