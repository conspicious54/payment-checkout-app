import { useState, useMemo, useEffect } from 'react';
import {
  validateEmail,
  validatePhone,
  validateName,
  validateSSN,
} from '../../utils/validation';
import type { FormSettings } from '../../utils/supabase';

interface IdentityVerificationStepProps {
  step: number;
  totalSteps: number;
  formData: {
    email: string;
    phone: string;
    fullName: string;
    ssn: string;
  };
  onInputChange: (field: keyof IdentityVerificationStepProps['formData'], value: string) => void;
  onNext: () => void;
  needsBankAccount: boolean;
  formSettings: FormSettings;
}

export function IdentityVerificationStep({
  step,
  totalSteps,
  formData,
  onInputChange,
  onNext,
  needsBankAccount,
  formSettings,
}: IdentityVerificationStepProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Determine which field we're actually on based on enabled settings
  const getActualField = useMemo(() => {
    let fieldStep = 0;
    if (formSettings.emailEnabled) {
      fieldStep++;
      if (step === fieldStep) return 'email';
    }
    if (formSettings.phoneEnabled) {
      fieldStep++;
      if (step === fieldStep) return 'phone';
    }
    if (formSettings.fullNameEnabled) {
      fieldStep++;
      if (step === fieldStep) return 'fullName';
    }
    if (formSettings.ssnEnabled) {
      fieldStep++;
      if (step === fieldStep) return 'ssn';
    }
    return '';
  }, [step, formSettings]);

  // Calculate validation without setting state during render
  const validationResult = useMemo(() => {
    const field = getActualField;
    switch (field) {
      case 'email':
        return validateEmail(formData.email);
      case 'phone':
        return validatePhone(formData.phone);
      case 'fullName':
        return validateName(formData.fullName);
      case 'ssn':
        return validateSSN(formData.ssn);
      default:
        return { isValid: false, errors: {} };
    }
  }, [getActualField, formData.email, formData.phone, formData.fullName, formData.ssn]);

  const isStepValid = validationResult.isValid;

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    onInputChange(field, value);
    // Mark field as touched when user starts typing
    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isStepValid) {
      e.preventDefault();
      e.stopPropagation();
      onNext();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStepValid) {
      onNext();
    }
  };

  const currentField = getActualField;
  const showErrors = touched[currentField] || false;

  return (
    <form onSubmit={handleFormSubmit} className="p-8 pt-16">
      <div className="flex items-center justify-center mb-8">
        <img src="/Logo-E1.png" alt="Divvy" className="h-8 brightness-0 invert" />
      </div>

      <div className="text-center mb-8">
        <div className="text-sm text-gray-400 mb-2">
          VERIFY IDENTITY | Step {step} of {totalSteps > 0 ? totalSteps : step}
        </div>
        <h2 className="text-3xl font-bold mb-4">Grow Now, Pay Later</h2>
        <p className="text-gray-400">
          Divvy offers flexible payment plans to break up your payment over time.{' '}
          <span className="text-white font-medium">
            Checking your eligibility won't affect your credit score.
          </span>
        </p>
      </div>

      <div className="mb-8">
        {getActualField === 'email' && formSettings.emailEnabled && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              onKeyDown={handleKeyDown}
              placeholder="your@email.com"
              className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                showErrors && validationResult.errors.email ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
              }`}
              autoFocus
              aria-invalid={!!(showErrors && validationResult.errors.email)}
              aria-describedby={showErrors && validationResult.errors.email ? 'email-error' : undefined}
            />
            {showErrors && validationResult.errors.email && (
              <p id="email-error" className="text-red-500 text-sm mt-2" role="alert">
                {validationResult.errors.email}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              We'll send your payment confirmation to this email.
            </p>
          </div>
        )}

        {getActualField === 'phone' && formSettings.phoneEnabled && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              PHONE NUMBER
            </label>
            <div className="flex gap-2">
              <select
                id="countryCode"
                value={formData.phone.startsWith('+1') ? '+1' : '+1'}
                onChange={(e) => {
                  const code = e.target.value;
                  const currentNumber = formData.phone.replace(/^\+1/, '').replace(/\D/g, '');
                  handleInputChange('phone', code + currentNumber);
                }}
                className="w-20 bg-[#0a0a0a] border border-gray-800 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                aria-label="Country code"
              >
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+33">+33</option>
                <option value="+49">+49</option>
                <option value="+81">+81</option>
                <option value="+86">+86</option>
                <option value="+91">+91</option>
                <option value="+52">+52</option>
                <option value="+55">+55</option>
                <option value="+61">+61</option>
              </select>
              <input
                id="phone"
                type="tel"
                value={formData.phone.replace(/^\+\d+/, '')}
                onChange={(e) => {
                  const countryCode = formData.phone.match(/^\+\d+/)?.[0] || '+1';
                  const number = e.target.value.replace(/\D/g, '');
                  handleInputChange('phone', countryCode + number);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                onKeyDown={handleKeyDown}
                placeholder="(555) 123-4567"
                className={`flex-1 bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                  showErrors && validationResult.errors.phone ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
                }`}
                autoFocus
                aria-invalid={!!(showErrors && validationResult.errors.phone)}
                aria-describedby={showErrors && validationResult.errors.phone ? 'phone-error' : undefined}
              />
            </div>
            {showErrors && validationResult.errors.phone && (
              <p id="phone-error" className="text-red-500 text-sm mt-2" role="alert">
                {validationResult.errors.phone}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              We'll send you a verification code via SMS. Text and data rates may apply.
            </p>
          </div>
        )}

        {getActualField === 'fullName' && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              FULL NAME
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
              onKeyDown={handleKeyDown}
              placeholder="John Doe"
              className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                showErrors && validationResult.errors.fullName ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
              }`}
              autoFocus
              aria-invalid={!!(showErrors && validationResult.errors.fullName)}
              aria-describedby={showErrors && validationResult.errors.fullName ? 'name-error' : undefined}
            />
            {showErrors && validationResult.errors.fullName && (
              <p id="name-error" className="text-red-500 text-sm mt-2" role="alert">
                {validationResult.errors.fullName}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              Enter your full legal name as it appears on your ID.
            </p>
          </div>
        )}

        {getActualField === 'ssn' && formSettings.ssnEnabled && (
          <div>
            <label htmlFor="ssn" className="block text-sm font-medium mb-2">
              LAST 4 DIGITS OF SSN
            </label>
            <input
              id="ssn"
              type="text"
              value={formData.ssn}
              onChange={(e) => handleInputChange('ssn', e.target.value.replace(/\D/g, '').slice(0, 4))}
              onBlur={() => setTouched((prev) => ({ ...prev, ssn: true }))}
              onKeyDown={handleKeyDown}
              placeholder="••••"
              maxLength={4}
              className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-2xl tracking-widest text-center ${
                showErrors && validationResult.errors.ssn ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
              }`}
              autoFocus
              aria-invalid={!!(showErrors && validationResult.errors.ssn)}
              aria-describedby={showErrors && validationResult.errors.ssn ? 'ssn-error' : undefined}
            />
            {showErrors && validationResult.errors.ssn && (
              <p id="ssn-error" className="text-red-500 text-sm mt-2" role="alert">
                {validationResult.errors.ssn}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              We use this to verify your identity and check your eligibility.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        onKeyDown={handleKeyDown}
        disabled={!isStepValid}
        className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
        aria-label={step === totalSteps ? (needsBankAccount ? 'Continue to Bank Account' : 'Continue to Agreement') : 'Continue to next step'}
      >
        {step === totalSteps
          ? needsBankAccount && formSettings.bankAccountEnabled
            ? 'Continue to Bank Account'
            : 'Continue to Agreement'
          : 'Continue'}
      </button>

      <p className="text-gray-500 text-xs text-center mt-6 leading-relaxed">
        By continuing, I agree to Divvy's Terms of Service, E-Sign Consent, and Privacy Policy
        and authorize Divvy to obtain, use, and share consumer reports about me.
      </p>
    </form>
  );
}
