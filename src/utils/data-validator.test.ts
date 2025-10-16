/**
 * Tests for DataValidator
 */

import { describe, it, expect } from 'vitest';
import { DataValidator, quickValidate } from './data-validator';

describe('DataValidator', () => {
  it('should validate correct email', () => {
    const validator = new DataValidator();
    console.log('Testing email validation');

    expect(validator.validateEmail('test@example.com')).toBe(true);
    expect(validator.validateEmail('invalid-email')).toBe(false);
  });

  it('should validate phone numbers', () => {
    const validator = new DataValidator();
    console.log('Testing phone validation');

    expect(validator.validatePhone('1234567890')).toBe(true);
    expect(validator.validatePhone('123')).toBe(false);
  });

  it('should validate URLs', () => {
    const validator = new DataValidator();

    expect(validator.validateUrl('https://example.com')).toBe(true);
    expect(validator.validateUrl('not-a-url')).toBe(false);
  });

  // TODO: Add more test cases
});

describe('quickValidate', () => {
  it('should validate using helper function', () => {
    console.log('Testing quick validate');

    expect(quickValidate('test@example.com', 'email')).toBe(true);
    expect(quickValidate('1234567890', 'phone')).toBe(true);
  });
});
