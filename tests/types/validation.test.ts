import { describe, it, expect } from 'vitest';
import { BrandContextSchema } from '../../src/types/index.js';

describe('BrandContext Validation', () => {
  describe('valid brand contexts', () => {
    it('should validate minimal brand context', () => {
      const minimalContext = {
        brandName: 'Test Brand',
        category: 'Test Category'
      };

      const result = BrandContextSchema.safeParse(minimalContext);
      expect(result.success).toBe(true);
    });

    it('should validate complete brand context', () => {
      const completeContext = {
        brandName: 'Test Brand',
        category: 'Test Category',
        currentRevenue: '₹10 Cr',
        targetRevenue: '₹50 Cr',
        website: 'https://testbrand.com',
        competitors: ['Competitor A', 'Competitor B'],
        dataSources: [
          {
            type: 'pdf',
            path: './data/report.pdf',
            description: 'Q1 Report'
          }
        ],
        customInstructions: 'Focus on premium positioning'
      };

      const result = BrandContextSchema.safeParse(completeContext);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid brand contexts', () => {
    it('should reject missing brandName', () => {
      const invalid = {
        category: 'Test Category'
      };

      const result = BrandContextSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject missing category', () => {
      const invalid = {
        brandName: 'Test Brand'
      };

      const result = BrandContextSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid website URL', () => {
      const invalid = {
        brandName: 'Test Brand',
        category: 'Test Category',
        website: 'not-a-url'
      };

      const result = BrandContextSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid dataSource type', () => {
      const invalid = {
        brandName: 'Test Brand',
        category: 'Test Category',
        dataSources: [
          {
            type: 'invalid_type',
            path: './data/report.pdf'
          }
        ]
      };

      const result = BrandContextSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('default values', () => {
    it('should provide default empty array for competitors', () => {
      const context = {
        brandName: 'Test Brand',
        category: 'Test Category'
      };

      const result = BrandContextSchema.parse(context);
      expect(result.competitors).toEqual([]);
    });

    it('should provide default empty array for dataSources', () => {
      const context = {
        brandName: 'Test Brand',
        category: 'Test Category'
      };

      const result = BrandContextSchema.parse(context);
      expect(result.dataSources).toEqual([]);
    });
  });
});
