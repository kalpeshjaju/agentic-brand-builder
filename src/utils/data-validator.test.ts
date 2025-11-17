/**
 * Tests for DataValidator
 */

import { describe, it, expect } from 'vitest';
import { DataValidator, quickValidate } from './data-validator';

describe('DataValidator', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validator = new DataValidator();

      expect(validator.validateEmail('test@example.com')).toBe(true);
      expect(validator.validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validator.validateEmail('valid_email@domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const validator = new DataValidator();

      expect(validator.validateEmail('invalid-email')).toBe(false);
      expect(validator.validateEmail('@example.com')).toBe(false);
      expect(validator.validateEmail('user@')).toBe(false);
      expect(validator.validateEmail('user @example.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      const validator = new DataValidator();

      expect(validator.validatePhone('1234567890')).toBe(true);
      expect(validator.validatePhone('+1-234-567-8900')).toBe(true);
      expect(validator.validatePhone('(123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      const validator = new DataValidator();

      expect(validator.validatePhone('123')).toBe(false);
      expect(validator.validatePhone('12345678901234567890')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      const validator = new DataValidator();

      expect(validator.validateUrl('https://example.com')).toBe(true);
      expect(validator.validateUrl('http://subdomain.example.com/path')).toBe(true);
      expect(validator.validateUrl('https://example.com:8080/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const validator = new DataValidator();

      expect(validator.validateUrl('not-a-url')).toBe(false);
      expect(validator.validateUrl('example.com')).toBe(false);
    });
  });

  describe('validateRange', () => {
    it('should validate numbers within range', () => {
      const validator = new DataValidator();

      expect(validator.validateRange(5, 1, 10)).toBe(true);
      expect(validator.validateRange(1, 1, 10)).toBe(true);
      expect(validator.validateRange(10, 1, 10)).toBe(true);
    });

    it('should reject numbers outside range', () => {
      const validator = new DataValidator();

      expect(validator.validateRange(0, 1, 10)).toBe(false);
      expect(validator.validateRange(11, 1, 10)).toBe(false);
    });
  });

  describe('validateCreditCard', () => {
    it('should validate correct credit card numbers using Luhn algorithm', () => {
      const validator = new DataValidator();

      // Valid test card numbers
      expect(validator.validateCreditCard('4532015112830366')).toBe(true);
      expect(validator.validateCreditCard('4532-0151-1283-0366')).toBe(true);
    });

    it('should reject invalid credit card numbers', () => {
      const validator = new DataValidator();

      expect(validator.validateCreditCard('1234567890123456')).toBe(false);
      expect(validator.validateCreditCard('123')).toBe(false);
      expect(validator.validateCreditCard('abcd1234abcd1234')).toBe(false);
    });
  });

  describe('caching', () => {
    it('should cache and retrieve validation results', () => {
      const validator = new DataValidator();

      validator.cacheResult('test-key', true);
      expect(validator.getCached('test-key')).toBe(true);

      validator.cacheResult('another-key', false);
      expect(validator.getCached('another-key')).toBe(false);
    });

    it('should return undefined for non-existent cache keys', () => {
      const validator = new DataValidator();
      expect(validator.getCached('non-existent')).toBeUndefined();
    });
  });
});

describe('quickValidate', () => {
  it('should validate email using helper function', () => {
    expect(quickValidate('test@example.com', 'email')).toBe(true);
    expect(quickValidate('invalid', 'email')).toBe(false);
  });

  it('should validate phone using helper function', () => {
    expect(quickValidate('1234567890', 'phone')).toBe(true);
    expect(quickValidate('123', 'phone')).toBe(false);
  });

  it('should validate URL using helper function', () => {
    expect(quickValidate('https://example.com', 'url')).toBe(true);
    expect(quickValidate('not-a-url', 'url')).toBe(false);
  });
});
