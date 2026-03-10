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
    { months: 18, perPayment: 433.12, totalPayments: 18 },
    { months: 12, perPayment: 599.70, totalPayments: 12 },
    { months: 6, perPayment: 1099.45, totalPayments: 6 },
    { months: 3, perPayment: 2098.95, totalPayments: 3 },
    { months: 2, perPayment: 2998.50, totalPayments: 2 },
  ],
  '600-700': [
    { months: 18, perPayment: 433.12, totalPayments: 18 },
    { months: 12, perPayment: 599.70, totalPayments: 12 },
    { months: 6, perPayment: 1099.45, totalPayments: 6 },
    { months: 3, perPayment: 2098.95, totalPayments: 3 },
    { months: 2, perPayment: 2998.50, totalPayments: 2 },
  ],
  'below-600': [
    { months: 18, perPayment: 439.78, totalPayments: 18 },
    { months: 12, perPayment: 609.70, totalPayments: 12 },
    { months: 6, perPayment: 1119.44, totalPayments: 6 },
    { months: 3, perPayment: 2138.93, totalPayments: 3 },
    { months: 2, perPayment: 3058.47, totalPayments: 2 },
  ],
};

export const creditTierLabels: Record<CreditTier, string> = {
  '700+': '700+',
  '600-700': '600-700',
  'below-600': 'Below 600',
};
