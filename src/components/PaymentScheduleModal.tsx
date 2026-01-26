import { X } from 'lucide-react';
import type { PaymentPlan, PaymentFrequency } from '../constants';

interface PaymentScheduleModalProps {
  plan: PaymentPlan;
  dates: Date[];
  totalAmount: number;
  frequency: PaymentFrequency;
  onClose: () => void;
}

export function PaymentScheduleModal({
  plan,
  dates,
  totalAmount,
  frequency,
  onClose,
}: PaymentScheduleModalProps) {
  const formatDate = (date: Date, index: number) => {
    if (index === 0) return 'Today';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
    >
      <div className="bg-[#0f0f0f] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0f0f0f] border-b border-gray-800 p-6 flex justify-between items-center">
          <h2 id="schedule-modal-title" className="text-2xl font-bold">Payment Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close payment schedule"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="mb-12">
            <div className="flex items-end gap-2 h-64 mb-4" role="list" aria-label="Payment schedule visualization">
              {dates.map((date, i) => {
                const height = ((i + 1) / plan.totalPayments) * 100;

                return (
                  <div 
                    key={i} 
                    className="flex-1 flex flex-col items-center justify-end h-full"
                    role="listitem"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-blue-600 rounded-t-lg transition-all"
                      style={{ height: `${height}%` }}
                      aria-label={`Payment ${i + 1}: $${plan.perPayment.toFixed(2)} on ${formatDate(date, i)}`}
                    />
                    <div className="mt-3 text-center">
                      <div className="font-semibold text-sm">${plan.perPayment.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(date, i)}</div>
                    </div>
                  </div>
                );
              })}
              {plan.totalPayments > 12 && (
                <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="text-sm">+{plan.totalPayments - 11}</div>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-gray-400 text-sm mb-2">Total Amount</div>
              <div className="text-3xl font-bold">${totalAmount.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-2">Payment Frequency</div>
              <div className="text-3xl font-bold">
                {frequency === 'monthly' ? 'Monthly' : 'Bi-weekly'}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-2">Number of Payments</div>
              <div className="text-3xl font-bold">{plan.totalPayments}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-2">Per Payment</div>
              <div className="text-3xl font-bold">${plan.perPayment.toFixed(2)}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 rounded-xl transition-all"
            aria-label="Close payment schedule"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
