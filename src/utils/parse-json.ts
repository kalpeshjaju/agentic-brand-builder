/**
 * Parses a JSON string, extracting it from a markdown code block if necessary.
 * @param jsonString The string to parse.
 * @returns The parsed JSON object.
 * @throws An error if the JSON cannot be parsed.
 */
export function parseJson<T>(jsonString: string): T {
  const sanitizedString = jsonString.trim();

  // Strategy 1: Try parsing directly
  try {
    return JSON.parse(sanitizedString) as T;
  } catch {
    // Ignore and try next strategy
  }

  // Strategy 2: Extract from markdown code block
  const match = sanitizedString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON from markdown block: ${(error as Error).message}`);
    }
  }

  // Strategy 3: Balanced brace counting (as a fallback)
  const startIdx = sanitizedString.indexOf('{');
  if (startIdx !== -1) {
    let jsonStr = '';
    let braceCount = 0;
    for (let i = startIdx; i < sanitizedString.length; i++) {
      const char = sanitizedString[i];
      jsonStr += char;
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          try {
            return JSON.parse(jsonStr) as T;
          } catch {
            // Fall through to the final error
          }
        }
      }
    }
  }

  throw new Error(
    'Failed to parse JSON from response. ' +
    `Response length: ${sanitizedString.length} chars. ` +
    `First 500 chars: ${sanitizedString.substring(0, 500)}... ` +
    'Please check if the response is valid JSON.'
  );
}
