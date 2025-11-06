
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';
import { readTextFile } from '../../utils/read-text-file.js';
import { parseJson } from '../../utils/parse-json.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * UX Synthesis Agent
 * Consolidates outputs from UX anaylsis agents into a holistic report.
 */
export class UxSynthesisAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = await readTextFile(
      resolve(__dirname, 'prompts/ux-synthesis-system.txt')
    );

    const userPromptTemplate = await readTextFile(
      resolve(__dirname, 'prompts/ux-synthesis-user.txt')
    );

    const userPrompt = userPromptTemplate
      .replace('{{brandContext}}', brandContext)
      .replace('{{previousOutputs}}', previousOutputs);

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 8000,
      temperature: 0.4,
    });

    try {
      const data = parseJson<{
        confidence?: number;
        sources?: string[];
      }>(response.content);

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: data.confidence || 0.8,
        sources: ['ux-synthesis'],
      };
    } catch (error) {
      throw new Error(
        `Failed to parse UX synthesis response: ${(error as Error).message}`
      );
    }
  }
}
