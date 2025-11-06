import { fileURLToPath } from 'node:url';
import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';
import { readTextFile } from '../../utils/read-text-file.js';
import { parseJson } from '../../utils/parse-json.js';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * UX Auditor Agent
 * Analyzes website UX/UI and provides comprehensive UI/UX audit focusing on conversion optimization, user experience, and visual design
 */
export class UxAuditorAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);

    await this.scraper.launch();
    const scrapedData = await this.scraper.scrape(
      input.context.website as string
    );
    await this.scraper.close();

    const systemPrompt = await readTextFile(
      resolve(__dirname, 'prompts/system.txt')
    );

    const userPrompt = await readTextFile(
      resolve(__dirname, 'prompts/user.txt')
    );
    const populatedUserPrompt = userPrompt
      .replace('{{brandContext}}', brandContext)
      .replace('{{html}}', scrapedData.html)
      .replace('{{brandName}}', input.context.brandName)
      .replace('{{website}}', input.context.website as string);

    const response = await this.callClaude(systemPrompt, populatedUserPrompt, {
      maxTokens: 8000,
      temperature: 0.3
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
        `Failed to parse UX audit response: ${(error as Error).message}`
      );
    }
  }
}





