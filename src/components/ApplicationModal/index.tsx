import { useState, useCallback, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import type { PaymentPlan, CreditTier, PaymentFrequency } from '../../constants';
import { IdentityVerificationStep } from './IdentityVerificationStep';
import { PhoneVerificationStep } from './PhoneVerificationStep';
import { BankAccountStep } from './BankAccountStep';
import { PaymentStep } from './PaymentStep';
import { submitApplication, fetchFormSettings, type FormSettings } from '../../utils/supabase';
import { useLoadingState } from '../../utils/loadingStates';
import { LoadingSpinner } from '../LoadingSpinner';

interface ApplicationModalProps {
  plan: PaymentPlan;
  creditTier: CreditTier;
  paymentFrequency: PaymentFrequency;
  onClose: () => void;
}

export function ApplicationModal({
  plan,
  creditTier,
  paymentFrequency,
  onClose,
}: ApplicationModalProps) {
  const [step, setStep] = useState(1);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showBankAccountScreen, setShowBankAccountScreen] = useState(false);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const { isLoading, error, startLoading, stopLoading, setError } = useLoadingState();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    ssn: '',
  });
  const [bankData, setBankData] = useState({
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking' as 'checking' | 'savings',
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expDate: '',
    cvv: '',
    zipCode: '',
  });
  const [signatureData, setSignatureData] = useState<{
    signatureName: string;
    signedAt: string;
    consentAgreed: boolean;
    agreementVersion: string;
  } | undefined>(undefined);
  const [formSettings, setFormSettings] = useState<FormSettings>({
    emailEnabled: true,
    phoneEnabled: true,
    phoneVerificationEnabled: true,
    ssnEnabled: true,
    bankAccountEnabled: true,
  });

  // Fetch form settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchFormSettings();
      if (settings) {
        console.log('Form settings loaded from database:', settings);
        setFormSettings(settings);
        // Reset to step 1 when settings load to ensure correct flow
        setStep(1);
        setShowPhoneVerification(false);
        setPhoneVerified(false);
      } else {
        console.warn('Form settings not loaded, using defaults. Check Supabase connection.');
      }
    };
    loadSettings();
  }, []);

  // Calculate total steps based on enabled fields
  const totalSteps = useMemo(() => {
    let steps = 0;
    if (formSettings.emailEnabled) steps++;
    if (formSettings.phoneEnabled) steps++;
    // Name is always required
    steps++;
    if (formSettings.ssnEnabled) steps++;
    return steps;
  }, [formSettings]);

  // Calculate which step number we're on based on enabled fields
  const getCurrentStepNumber = useCallback((step: number) => {
    let currentStep = 0;
    if (formSettings.emailEnabled) {
      currentStep++;
      if (step === 1) return currentStep;
    }
    if (formSettings.phoneEnabled) {
      currentStep++;
      if (step === 2) return currentStep;
    }
    // Name step
    currentStep++;
    if (step === 3) return currentStep;
    if (formSettings.ssnEnabled) {
      currentStep++;
      if (step === 4) return currentStep;
    }
    return currentStep;
  }, [formSettings]);

  const needsBankAccount = useMemo(
    () => (creditTier === 'below-600' || plan.months >= 6) && formSettings.bankAccountEnabled,
    [creditTier, plan.months, formSettings.bankAccountEnabled]
  );

  const handleNext = useCallback(() => {
    // Determine which field step we're on
    let currentFieldStep = 0;
    if (formSettings.emailEnabled) {
      currentFieldStep++;
      if (step === 1) {
        // After email, go to next enabled field
        if (formSettings.phoneEnabled) {
          setStep(2);
        } else {
          // Skip to name
          setStep(3);
        }
        return;
      }
    }
    if (formSettings.phoneEnabled) {
      currentFieldStep++;
    if (step === 2) {
        // After phone number, show phone verification if enabled
        if (formSettings.phoneVerificationEnabled) {
      setShowPhoneVerification(true);
        } else {
          // Skip verification, go to name
          setStep(3);
        }
        return;
      }
    }
    // Name step (always step 3)
    if (step === 3) {
      if (formSettings.ssnEnabled) {
        setStep(4);
      } else {
        // Skip SSN, go to bank account or payment
        if (needsBankAccount) {
          setShowBankAccountScreen(true);
    } else {
          setShowPaymentScreen(true);
        }
      }
      return;
    }
    // SSN step (step 4)
    if (step === 4) {
      if (needsBankAccount) {
        setShowBankAccountScreen(true);
      } else {
        setShowPaymentScreen(true);
      }
    }
  }, [step, formSettings, needsBankAccount]);

  const handlePhoneVerify = useCallback((code: string) => {
    // TODO: Verify code with backend API
    console.log('Verifying phone code:', code);
    // For now, just mark as verified
    setPhoneVerified(true);
    setShowPhoneVerification(false);
    // Move to name step (step 3)
    setStep(3);
  }, []);

  const handleResendCode = useCallback(() => {
    // TODO: Resend verification code via backend API
    console.log('Resending verification code to:', formData.phone);
    // In a real implementation, you would call an API to resend the code
  }, [formData.phone]);

  const handleBankAccountNext = useCallback(() => {
    setShowPaymentScreen(true);
  }, []);

  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBankDataChange = useCallback((
    field: keyof typeof bankData,
    value: string | 'checking' | 'savings'
  ) => {
    setBankData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePaymentInputChange = useCallback((field: keyof typeof paymentData, value: string) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFinalSubmit = async () => {
    if (!signatureData) {
      setError('Please sign the agreement before submitting');
      return;
    }

    startLoading();
    
    try {

      const result = await submitApplication({
        email: formData.email,
        phone: formData.phone,
        fullName: formData.fullName,
        ssn: formData.ssn,
        creditTier,
        planMonths: plan.months,
        planPerPayment: plan.perPayment,
        planTotalPayments: plan.totalPayments,
        paymentFrequency,
        bankAccount: showBankAccountScreen
          ? {
              accountType: bankData.accountType,
              routingNumber: bankData.routingNumber,
              accountNumber: bankData.accountNumber,
            }
          : undefined,
        paymentCard: {
          cardNumber: paymentData.cardNumber,
          expDate: paymentData.expDate,
          cvv: paymentData.cvv,
          zipCode: paymentData.zipCode,
        },
        signature: signatureData,
      });

      if (result.success) {
        stopLoading();
        onClose();
        // TODO: Show success message/toast
      } else {
        setError(result.error || 'Failed to submit application');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const progressPercentage = useMemo(() => {
    if (showPaymentScreen) return 100;
    if (showBankAccountScreen) return 80;
    if (showPhoneVerification) return 35; // Between step 2 and 3
    return (step / totalSteps) * 70;
  }, [showPaymentScreen, showBankAccountScreen, showPhoneVerification, step, totalSteps]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleClose = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    onClose();
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-[#141414] rounded-2xl max-w-md w-full relative overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close application modal"
          type="button"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {showPaymentScreen ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <div className="bg-[#141414] rounded-xl p-8 flex flex-col items-center gap-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-400">Submitting your application...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="p-4 mb-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm" role="alert">
                  {error}
                </p>
              </div>
            )}
            <PaymentStep
              plan={plan}
              paymentData={paymentData}
              onPaymentInputChange={handlePaymentInputChange}
              onSubmit={handleFinalSubmit}
              fullName={formData.fullName}
              signatureData={signatureData}
              onSignatureComplete={setSignatureData}
            />
          </>
        ) : showBankAccountScreen ? (
          <BankAccountStep
            bankData={bankData}
            onBankDataChange={handleBankDataChange}
            onNext={handleBankAccountNext}
          />
        ) : showPhoneVerification && formSettings.phoneVerificationEnabled ? (
          <PhoneVerificationStep
            phone={formData.phone}
            onVerify={handlePhoneVerify}
            onResend={handleResendCode}
          />
        ) : (
          <IdentityVerificationStep
            step={step}
            totalSteps={totalSteps}
            formData={formData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            needsBankAccount={needsBankAccount}
            formSettings={formSettings}
          />
        )}
      </div>
    </div>
  );
}
