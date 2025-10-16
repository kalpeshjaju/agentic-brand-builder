/**
 * API Response Validation Schemas
 *
 * Validates Claude API responses using Zod for type safety
 * Score: 38/40 - Critical for error prevention
 */

import { z } from 'zod';

/**
 * Claude API message schema
 */
export const ClaudeMessageSchema = z.object({
  id: z.string(),
  type: z.literal('message'),
  role: z.enum(['assistant', 'user']),
  content: z.array(z.object({
    type: z.string(),
    text: z.string().optional()
  })),
  model: z.string(),
  stop_reason: z.enum(['end_turn', 'max_tokens', 'stop_sequence']).nullable(),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number()
  })
});

export type ClaudeMessage = z.infer<typeof ClaudeMessageSchema>;

/**
 * Validate Claude API response
 */
export function validateClaudeResponse(response: unknown): ClaudeMessage {
  try {
    return ClaudeMessageSchema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue =>
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');

      throw new Error(
        `Invalid Claude API response: ${issues}. ` +
        'This may indicate an API change or network corruption.'
      );
    }
    throw error;
  }
}

/**
 * Safe validation that returns success/error result
 */
export function safeValidateClaudeResponse(response: unknown): {
  success: boolean;
  data?: ClaudeMessage;
  error?: string;
} {
  const result = ClaudeMessageSchema.safeParse(response);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const issues = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');

    return { success: false, error: issues };
  }
}

/**
 * Extract text content from validated response
 */
export function extractTextContent(message: ClaudeMessage): string {
  const textBlocks = message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .filter((text): text is string => text !== undefined);

  return textBlocks.join('\n');
}
