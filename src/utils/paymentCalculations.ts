import type { PaymentPlan, PaymentFrequency } from '../constants';

/**
 * Adjusts a payment plan based on the selected payment frequency
 * @param plan - The base payment plan
 * @param frequency - Monthly or bi-weekly payment frequency
 * @returns Adjusted payment plan
 */
export function adjustPlanForFrequency(
  plan: PaymentPlan,
  frequency: PaymentFrequency
): PaymentPlan {
  if (frequency === 'monthly') {
    return plan;
  }

  // For bi-weekly: split monthly payment in half and round down to .99
  const halfPayment = plan.perPayment / 2;
  const roundedPayment = Math.floor(halfPayment) + 0.99;

  return {
    months: plan.months,
    perPayment: roundedPayment,
    totalPayments: plan.totalPayments * 2,
  };
}

/**
 * Calculates the total amount for a payment plan
 * @param plan - The payment plan
 * @returns Total amount
 */
export function calculateTotalAmount(plan: PaymentPlan): number {
  return plan.perPayment * plan.totalPayments;
}
