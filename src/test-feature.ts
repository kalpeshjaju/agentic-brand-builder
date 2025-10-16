/**
 * Test feature for maker-checker demo
 */

export class TestFeature {
  private unusedVariable = 'not used';

  constructor() {
    console.log('TestFeature initialized');
    // TODO: Remove this debug logging
  }

  async processData(input: string): Promise<string> {
    console.log('Processing:', input);

    if (!input) {
      console.log('Empty input received');
      return '';
    }

    const result = input.toUpperCase();
    console.log('Result:', result);

    return result;
  }

  // TODO: Implement error handling
  validate(data: any): boolean {
    console.log('Validating:', data);
    return true;
  }
}
