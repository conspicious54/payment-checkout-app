import type { PaymentPlan, PaymentFrequency } from '../constants';
import { adjustPlanForFrequency } from '../utils/paymentCalculations';

interface PlanSelectorProps {
  plans: PaymentPlan[];
  selectedPlanIndex: number;
  paymentFrequency: PaymentFrequency;
  onPlanSelect: (index: number) => void;
}

export function PlanSelector({
  plans,
  selectedPlanIndex,
  paymentFrequency,
  onPlanSelect,
}: PlanSelectorProps) {
  return (
    <div className="space-y-4 mb-16" role="radiogroup" aria-label="Payment plan selection">
      {plans.map((plan, index) => {
        const adjustedPlan = adjustPlanForFrequency(plan, paymentFrequency);
        return (
          <button
            key={plan.months}
            onClick={() => onPlanSelect(index)}
            role="radio"
            aria-checked={selectedPlanIndex === index}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedPlanIndex === index
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{plan.months} months</span>
              <div className="text-right">
                <div className="text-xl font-semibold">
                  ${adjustedPlan.perPayment.toFixed(2)} / payment
                </div>
                <div className="text-gray-500 text-sm">
                  {adjustedPlan.totalPayments} payments
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
