import type { PaymentFrequency } from '../constants';

/**
 * Generates payment dates based on frequency and number of payments
 * @param totalPayments - Total number of payments
 * @param frequency - Monthly or bi-weekly payment frequency
 * @returns Array of payment dates
 */
export function generatePaymentDates(
  totalPayments: number,
  frequency: PaymentFrequency
): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  for (let i = 0; i < totalPayments; i++) {
    const date = new Date(today);
    if (frequency === 'monthly') {
      date.setMonth(date.getMonth() + i);
    } else {
      date.setDate(date.getDate() + (i * 14));
    }
    dates.push(date);
  }

  return dates;
}
