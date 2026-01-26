import { Shield } from 'lucide-react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { validateBankAccount } from '../../utils/validation';

interface BankAccountStepProps {
  bankData: {
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
  };
  onBankDataChange: (field: keyof BankAccountStepProps['bankData'], value: string | 'checking' | 'savings') => void;
  onNext: () => void;
}

export function BankAccountStep({
  bankData,
  onBankDataChange,
  onNext,
}: BankAccountStepProps) {
  const [touched, setTouched] = useState({
    routingNumber: false,
    accountNumber: false,
  });
  const hasAdvancedRef = useRef(false);
  const onNextRef = useRef(onNext);

  // Keep the ref updated
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  const validation = useMemo(
    () => validateBankAccount(bankData.accountNumber, bankData.routingNumber),
    [bankData.accountNumber, bankData.routingNumber]
  );

  // Check and auto-advance when both fields are valid
  useEffect(() => {
    const routingValid = bankData.routingNumber.length === 9;
    const accountValid = bankData.accountNumber.length >= 4;
    const bothValid = routingValid && accountValid && validation.isValid;
    
    console.log('Bank Account Step - Routing:', bankData.routingNumber.length, 'Account:', bankData.accountNumber.length, 'Validation isValid:', validation.isValid, 'Validation errors:', validation.errors, 'Both Valid:', bothValid, 'Has Advanced:', hasAdvancedRef.current);
    
    if (bothValid && !hasAdvancedRef.current) {
      console.log('✅ AUTO-ADVANCING to payment screen NOW');
      hasAdvancedRef.current = true;
      const timer = setTimeout(() => {
        console.log('🚀 Calling onNext()');
        try {
          onNextRef.current();
          console.log('✅ onNext() called successfully');
        } catch (error) {
          console.error('❌ Error calling onNext():', error);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [bankData.routingNumber, bankData.accountNumber, validation]);

  const handleInputChange = (field: 'routingNumber' | 'accountNumber', value: string) => {
    onBankDataChange(field, value);
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && validation.isValid) {
      e.preventDefault();
      e.stopPropagation();
      hasAdvancedRef.current = true; // Prevent auto-advance if user manually triggers
      onNext();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.isValid) {
      hasAdvancedRef.current = true;
      onNext();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-8 pt-16">
      <div className="flex items-center justify-center mb-8">
        <img src="/divvylogo.png" alt="Divvy" className="h-8" />
      </div>

      <div className="text-center mb-8">
        <div className="text-sm text-gray-400 mb-2">CONNECT BANK ACCOUNT</div>
        <h2 className="text-3xl font-bold mb-4">Link Your Bank Account</h2>
        <p className="text-gray-400">
          For your payment plan, we need to verify your bank account for automatic payments.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">ACCOUNT TYPE</label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
            <button
              onClick={() => onBankDataChange('accountType', 'checking')}
              aria-pressed={bankData.accountType === 'checking'}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                bankData.accountType === 'checking'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0a0a0a] text-gray-400 border border-gray-800 hover:border-gray-700'
              }`}
            >
              Checking
            </button>
            <button
              onClick={() => onBankDataChange('accountType', 'savings')}
              aria-pressed={bankData.accountType === 'savings'}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                bankData.accountType === 'savings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0a0a0a] text-gray-400 border border-gray-800 hover:border-gray-700'
              }`}
            >
              Savings
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="routingNumber" className="block text-sm font-medium mb-2">
            ROUTING NUMBER
          </label>
          <input
            id="routingNumber"
            type="text"
            value={bankData.routingNumber}
            onChange={(e) => handleInputChange('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
            onBlur={() => setTouched((prev) => ({ ...prev, routingNumber: true }))}
            onKeyDown={handleKeyDown}
            placeholder="123456789"
            maxLength={9}
            className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
              touched.routingNumber && validation.errors.routingNumber ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
            }`}
            aria-invalid={!!(touched.routingNumber && validation.errors.routingNumber)}
            aria-describedby={touched.routingNumber && validation.errors.routingNumber ? 'routing-error' : undefined}
          />
          {touched.routingNumber && validation.errors.routingNumber && (
            <p id="routing-error" className="text-red-500 text-xs mt-2" role="alert">
              {validation.errors.routingNumber}
            </p>
          )}
          <p className="text-gray-500 text-xs mt-2">
            9-digit number found on the bottom of your check
          </p>
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium mb-2">
            ACCOUNT NUMBER
          </label>
          <input
            id="accountNumber"
            type="text"
            value={bankData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
            onBlur={() => setTouched((prev) => ({ ...prev, accountNumber: true }))}
            onKeyDown={handleKeyDown}
            placeholder="000123456789"
            className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
              touched.accountNumber && validation.errors.accountNumber ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
            }`}
            aria-invalid={!!(touched.accountNumber && validation.errors.accountNumber)}
            aria-describedby={touched.accountNumber && validation.errors.accountNumber ? 'account-error' : undefined}
          />
          {touched.accountNumber && validation.errors.accountNumber && (
            <p id="account-error" className="text-red-500 text-xs mt-2" role="alert">
              {validation.errors.accountNumber}
            </p>
          )}
          <p className="text-gray-500 text-xs mt-2">Your full account number</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-xl p-4 mb-6 border border-yellow-900/30">
        <div className="flex gap-3">
          <div className="text-yellow-500 mt-0.5" aria-hidden="true">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-gray-300 font-medium mb-1">Bank-Level Security</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your bank information is encrypted with 256-bit SSL encryption and will only be used
              for automatic payment processing.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!validation.isValid}
        onKeyDown={handleKeyDown}
        className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-4 rounded-xl transition-all disabled:cursor-not-allowed"
        aria-label="Continue to payment information"
      >
        Continue to Payment
      </button>
    </form>
  );
}
