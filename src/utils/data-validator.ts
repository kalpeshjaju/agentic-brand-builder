/**
 * Data Validator Utility
 * Validates various data types and formats
 */

const CREDIT_CARD_LENGTH = 16;

interface ValidationCache {
  [key: string]: boolean;
}

export class DataValidator {
  private cache: ValidationCache = {};

  /**
   * Validate email format using comprehensive regex
   */
  validateEmail(email: string): boolean {
    // RFC 5322 compliant email regex
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
  }

  /**
   * Validate phone number (E.164 format)
   */
  validatePhone(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Must be between 10-15 digits and start with valid country code
    if (cleaned.length < 10 || cleaned.length > 15) {
      return false;
    }

    // Basic validation - all digits
    return /^\d+$/.test(cleaned);
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if value is within range
   */
  validateRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate credit card number using Luhn algorithm
   */
  validateCreditCard(cardNumber: string): boolean {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '');

    // Must be 16 digits
    if (cleaned.length !== CREDIT_CARD_LENGTH || !/^\d+$/.test(cleaned)) {
      return false;
    }

    // Luhn algorithm implementation
    let sum = 0;
    let isEven = false;

    // Loop through values starting from the rightmost digit
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Cache validation result
   */
  cacheResult(key: string, value: boolean): void {
    this.cache[key] = value;
  }

  /**
   * Get cached result
   */
  getCached(key: string): boolean | undefined {
    return this.cache[key];
  }
}

/**
 * Helper function for quick validation
 */
export function quickValidate(data: string, type: 'email' | 'phone' | 'url'): boolean {
  const validator = new DataValidator();

  switch (type) {
    case 'email':
      return validator.validateEmail(data);
    case 'phone':
      return validator.validatePhone(data);
    case 'url':
      return validator.validateUrl(data);
    default:
      return false;
  }
}
