import { promises as fs } from 'node:fs';

/**
 * Reads a text file and returns its content as a string.
 * @param filePath The path to the text file.
 * @returns The content of the file as a string.
 */
export async function readTextFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file at ${filePath}: ${(error as Error).message}`);
  }
}
