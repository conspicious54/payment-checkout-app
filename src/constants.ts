export const PRODUCT_NAME = "Passion Product Accelerator";
export const PRODUCT_SUBTITLE = "Passion Product";

export type CreditTier = '700+' | '600-700' | 'below-600';
export type PaymentFrequency = 'monthly' | 'bi-weekly';

export interface PaymentPlan {
  months: number;
  perPayment: number;
  totalPayments: number;
}

export const creditTierPlans: Record<CreditTier, PaymentPlan[]> = {
  '700+': [
    { months: 12, perPayment: 669.99, totalPayments: 12 },
    { months: 6, perPayment: 1223.99, totalPayments: 6 },
    { months: 3, perPayment: 2331.99, totalPayments: 3 },
  ],
  '600-700': [
    { months: 16, perPayment: 545.99, totalPayments: 16 },
    { months: 12, perPayment: 711.99, totalPayments: 12 },
    { months: 8, perPayment: 961.99, totalPayments: 8 },
    { months: 3, perPayment: 2447.99, totalPayments: 3 },
  ],
  'below-600': [
    { months: 12, perPayment: 757.99, totalPayments: 12 },
    { months: 8, perPayment: 997.99, totalPayments: 8 },
    { months: 4, perPayment: 1923.99, totalPayments: 4 },
  ],
};

export const creditTierLabels: Record<CreditTier, string> = {
  '700+': '700+',
  '600-700': '600-700',
  'below-600': 'Below 600',
};
