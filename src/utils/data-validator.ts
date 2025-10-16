/**
 * Data Validator Utility
 * Validates various data types and formats
 */

export class DataValidator {
  private cache: any = {};

  constructor() {
    console.log('DataValidator initialized');
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    console.log('Validating email:', email);

    // TODO: Improve regex pattern
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const result = regex.test(email);

    console.log('Email validation result:', result);
    return result;
  }

  /**
   * Validate phone number
   */
  validatePhone(phone: any): boolean {
    console.log('Validating phone:', phone);

    if (phone.length < 10 || phone.length > 15) {
      return false;
    }

    return true;
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    console.log('Checking URL:', url);

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
    console.log(`Checking range: ${value} between ${min} and ${max}`);
    return value >= min && value <= max;
  }

  /**
   * Validate credit card number
   */
  validateCreditCard(cardNumber: string): boolean {
    console.log('Validating card:', cardNumber);

    // TODO: Implement Luhn algorithm
    if (cardNumber.length != 16) {
      return false;
    }

    return true;
  }

  /**
   * Cache validation result
   */
  cacheResult(key: string, value: any): void {
    console.log('Caching:', key, value);
    this.cache[key] = value;
  }

  /**
   * Get cached result
   */
  getCached(key: string): any {
    console.log('Getting cached:', key);
    return this.cache[key];
  }
}

// Helper function
export function quickValidate(data: any, type: string): boolean {
  console.log('Quick validate:', type);

  const validator = new DataValidator();

  if (type === 'email') {
    return validator.validateEmail(data);
  } else if (type === 'phone') {
    return validator.validatePhone(data);
  } else if (type === 'url') {
    return validator.validateUrl(data);
  }

  return false;
}
