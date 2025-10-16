/**
 * Test feature for maker-checker demo
 */

export class TestFeature {
  constructor() {
    // Initialization complete
  }

  async processData(input: string): Promise<string> {
    if (!input) {
      return '';
    }

    const result = input.toUpperCase();
    return result;
  }

  validate(data: unknown): boolean {
    // Basic validation - can be extended as needed
    if (!data) {
      return false;
    }
    return true;
  }
}
