import { Lock, Calendar, Shield } from 'lucide-react';
import { PaymentIndicator } from './PaymentIndicator';
import type { PaymentPlan, PaymentFrequency } from '../constants';
import { PRODUCT_NAME } from '../constants';

interface PaymentSummaryProps {
  plan: PaymentPlan;
  paymentFrequency: PaymentFrequency;
  onScheduleClick: () => void;
  onApplicationClick: () => void;
}

export function PaymentSummary({
  plan,
  paymentFrequency,
  onScheduleClick,
  onApplicationClick,
}: PaymentSummaryProps) {
  return (
    <div className="bg-[#141414] rounded-2xl p-8 sticky top-8">
      <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-6">Summary</h3>

      <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden"
              aria-label="Product logo"
            >
              <img src="/ppf-logo.png" alt="PPF" className="w-full h-full object-contain p-1" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs">
              1
            </div>
          </div>
          <div>
            <div className="font-semibold">{PRODUCT_NAME}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">
            ${plan.perPayment.toFixed(2)}
            <span className="text-sm font-normal text-gray-500">/payment</span>
          </div>
          <div className="text-gray-500 text-sm">for {plan.totalPayments} payments</div>
        </div>
      </div>

      <div
        className="bg-[#1a1a1a] rounded-xl p-6 mb-8 cursor-pointer hover:bg-[#1f1f1f] transition-colors"
        onClick={onScheduleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onScheduleClick();
          }
        }}
        aria-label="View payment schedule"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold">D</span>
            </div>
            <div>
              <div className="text-2xl font-bold">${plan.perPayment.toFixed(2)}</div>
              <div className="text-gray-500 text-sm">
                {paymentFrequency === 'monthly' ? 'Every month' : 'Every 2 weeks'}
              </div>
            </div>
          </div>
          <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
            {plan.totalPayments} payments
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[...Array(Math.min(4, plan.totalPayments))].map((_, i) => (
            <PaymentIndicator key={i} index={i} total={plan.totalPayments} />
          ))}
          {plan.totalPayments > 4 && (
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 text-sm">
              +{plan.totalPayments - 4}
            </div>
          )}
        </div>
        <div className="flex justify-between mt-2">
          {[...Array(Math.min(4, plan.totalPayments))].map((_, i) => (
            <div key={i} className="text-xs text-gray-500 w-12 text-center">
              ${plan.perPayment.toFixed(2)}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-2xl font-bold">Due today</span>
          <span className="text-gray-500 text-sm">(1st of {plan.totalPayments})</span>
        </div>
        <div className="text-4xl font-bold">${plan.perPayment.toFixed(2)}</div>
      </div>

      <button
        onClick={onApplicationClick}
        className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 rounded-xl transition-all mb-4 text-lg flex items-center justify-center gap-2"
        aria-label="Start application with Divvy"
      >
        <span>Pay with</span>
        <img src="/Logo-E1.png" alt="Divvy" className="h-6" />
      </button>

      <p className="text-gray-500 text-xs text-center leading-relaxed">
        Estimates. You'll confirm exact dates and totals on the next screen.
      </p>

      <div className="grid grid-cols-3 gap-8 mt-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-gray-500" aria-hidden="true" />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Seamless, secure<br />checkout
          </p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-gray-500" aria-hidden="true" />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Flexible plans that<br />fit
          </p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-gray-500" aria-hidden="true" />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Instant approval<br />decisions
          </p>
        </div>
      </div>
    </div>
  );
}
