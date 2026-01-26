import { useState, useMemo } from 'react';
import type { PaymentPlan } from '../../constants';
import { validatePaymentCard } from '../../utils/validation';

interface PaymentStepProps {
  plan: PaymentPlan;
  paymentData: {
    cardNumber: string;
    expDate: string;
    cvv: string;
    zipCode: string;
  };
  onPaymentInputChange: (field: keyof PaymentStepProps['paymentData'], value: string) => void;
  onSubmit: () => void;
}

export function PaymentStep({
  plan,
  paymentData,
  onPaymentInputChange,
  onSubmit,
}: PaymentStepProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validation = useMemo(
    () => validatePaymentCard(
      paymentData.cardNumber,
      paymentData.expDate,
      paymentData.cvv,
      paymentData.zipCode
    ),
    [paymentData.cardNumber, paymentData.expDate, paymentData.cvv, paymentData.zipCode]
  );

  const isValid = validation.isValid;

  const handleInputChange = (field: keyof typeof paymentData, value: string) => {
    onPaymentInputChange(field, value);
    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      e.preventDefault();
      e.stopPropagation();
      onSubmit();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-8 pt-16">
      <div className="flex items-center justify-center mb-8">
        <img src="/divvylogo.png" alt="Divvy" className="h-8" />
      </div>

      <div className="text-center mb-8">
        <div className="text-sm text-gray-400 mb-2">PAYMENT INFORMATION</div>
        <h2 className="text-3xl font-bold mb-4">Complete Your Order</h2>
      </div>

      <div className="bg-[#0a0a0a] rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">First Payment</span>
          <span className="text-2xl font-bold">${plan.perPayment.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Due today</span>
          <span className="text-gray-500">{plan.totalPayments} payments total</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium mb-2">
            CARD NUMBER
          </label>
            <input
              id="cardNumber"
              type="text"
              value={paymentData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
              onBlur={() => setTouched((prev) => ({ ...prev, cardNumber: true }))}
              onKeyDown={handleKeyDown}
              placeholder="1234 5678 9012 3456"
              maxLength={16}
              className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                touched.cardNumber && validation.errors.cardNumber ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
              }`}
              aria-invalid={!!(touched.cardNumber && validation.errors.cardNumber)}
              aria-describedby={touched.cardNumber && validation.errors.cardNumber ? 'card-error' : undefined}
            />
            {touched.cardNumber && validation.errors.cardNumber && (
              <p id="card-error" className="text-red-500 text-sm mt-2" role="alert">
                {validation.errors.cardNumber}
              </p>
            )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label htmlFor="expDate" className="block text-sm font-medium mb-2">
              EXP DATE
            </label>
            <input
              id="expDate"
              type="text"
              value={paymentData.expDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                handleInputChange('expDate', value);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, expDate: true }))}
              onKeyDown={handleKeyDown}
              placeholder="MM/YY"
              maxLength={5}
              className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                touched.expDate && validation.errors.expDate ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
              }`}
              aria-invalid={!!(touched.expDate && validation.errors.expDate)}
              aria-describedby={touched.expDate && validation.errors.expDate ? 'exp-error' : undefined}
            />
            {touched.expDate && validation.errors.expDate && (
              <p id="exp-error" className="text-red-500 text-xs mt-2" role="alert">
                {validation.errors.expDate}
              </p>
            )}
          </div>
          <div className="col-span-1">
            <label htmlFor="cvv" className="block text-sm font-medium mb-2">
              CVV
            </label>
            <input
              id="cvv"
              type="text"
              value={paymentData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
              onBlur={() => setTouched((prev) => ({ ...prev, cvv: true }))}
              onKeyDown={handleKeyDown}
              placeholder="123"
              maxLength={4}
              className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                touched.cvv && validation.errors.cvv ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
              }`}
              aria-invalid={!!(touched.cvv && validation.errors.cvv)}
              aria-describedby={touched.cvv && validation.errors.cvv ? 'cvv-error' : undefined}
            />
            {touched.cvv && validation.errors.cvv && (
              <p id="cvv-error" className="text-red-500 text-xs mt-2" role="alert">
                {validation.errors.cvv}
              </p>
            )}
          </div>
          <div className="col-span-1">
            <label htmlFor="zipCode" className="block text-sm font-medium mb-2">
              ZIP
            </label>
            <input
              id="zipCode"
              type="text"
              value={paymentData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
              onBlur={() => setTouched((prev) => ({ ...prev, zipCode: true }))}
              onKeyDown={handleKeyDown}
              placeholder="12345"
              maxLength={5}
              className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                touched.zipCode && validation.errors.zipCode ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
              }`}
              aria-invalid={!!(touched.zipCode && validation.errors.zipCode)}
              aria-describedby={touched.zipCode && validation.errors.zipCode ? 'zip-error' : undefined}
            />
            {touched.zipCode && validation.errors.zipCode && (
              <p id="zip-error" className="text-red-500 text-xs mt-2" role="alert">
                {validation.errors.zipCode}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSubmit();
        }}
        onKeyDown={handleKeyDown}
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all mb-4"
        aria-label="Continue to payment processing"
      >
        Continue to Payment
      </button>

      <p className="text-gray-500 text-xs text-center leading-relaxed">
        Your payment information is encrypted and secure. You will be charged ${plan.perPayment.toFixed(2)} today.
      </p>
    </form>
  );
}
