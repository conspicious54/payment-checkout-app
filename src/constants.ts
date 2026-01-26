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
    { months: 6, perPayment: 1099.45, totalPayments: 6 },
    { months: 3, perPayment: 2098.95, totalPayments: 3 },
    { months: 2, perPayment: 3103.45, totalPayments: 2 },
  ],
  '600-700': [
    { months: 6, perPayment: 1099.45, totalPayments: 6 },
    { months: 3, perPayment: 2098.95, totalPayments: 3 },
    { months: 2, perPayment: 3103.45, totalPayments: 2 },
  ],
  'below-600': [
    { months: 6, perPayment: 1119.44, totalPayments: 6 },
    { months: 3, perPayment: 2138.93, totalPayments: 3 },
    { months: 2, perPayment: 3163.42, totalPayments: 2 },
  ],
};

export const creditTierLabels: Record<CreditTier, string> = {
  '700+': '700+',
  '600-700': '600-700',
  'below-600': 'Below 600',
};
