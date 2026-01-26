import { describe, it, expect } from 'vitest';
import { adjustPlanForFrequency, calculateTotalAmount } from '../paymentCalculations';
import type { PaymentPlan } from '../../constants';

describe('paymentCalculations', () => {
  describe('adjustPlanForFrequency', () => {
    it('should return the same plan for monthly frequency', () => {
      const plan: PaymentPlan = {
        months: 12,
        perPayment: 669.99,
        totalPayments: 12,
      };

      const result = adjustPlanForFrequency(plan, 'monthly');

      expect(result).toEqual(plan);
    });

    it('should adjust plan for bi-weekly frequency', () => {
      const plan: PaymentPlan = {
        months: 12,
        perPayment: 669.99,
        totalPayments: 12,
      };

      const result = adjustPlanForFrequency(plan, 'bi-weekly');

      expect(result.months).toBe(12);
      expect(result.totalPayments).toBe(24); // 12 * 2
      expect(result.perPayment).toBeCloseTo(334.99, 2); // 669.99 / 2 = 334.995, rounded down to 334.99
    });

    it('should handle bi-weekly rounding correctly', () => {
      const plan: PaymentPlan = {
        months: 6,
        perPayment: 1223.99,
        totalPayments: 6,
      };

      const result = adjustPlanForFrequency(plan, 'bi-weekly');

      expect(result.totalPayments).toBe(12);
      // 1223.99 / 2 = 611.995, Math.floor(611.995) = 611, + 0.99 = 611.99
      expect(result.perPayment).toBe(611.99);
    });
  });

  describe('calculateTotalAmount', () => {
    it('should calculate total amount correctly', () => {
      const plan: PaymentPlan = {
        months: 12,
        perPayment: 669.99,
        totalPayments: 12,
      };

      const total = calculateTotalAmount(plan);

      expect(total).toBe(8039.88); // 669.99 * 12
    });

    it('should handle bi-weekly adjusted plans', () => {
      const plan: PaymentPlan = {
        months: 12,
        perPayment: 334.99,
        totalPayments: 24,
      };

      const total = calculateTotalAmount(plan);

      expect(total).toBe(8039.76); // 334.99 * 24
    });
  });
});
