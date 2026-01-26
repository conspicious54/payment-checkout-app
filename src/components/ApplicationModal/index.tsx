import { useState, useCallback, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import type { PaymentPlan, CreditTier, PaymentFrequency } from '../../constants';
import { IdentityVerificationStep } from './IdentityVerificationStep';
import { PhoneVerificationStep } from './PhoneVerificationStep';
import { BankAccountStep } from './BankAccountStep';
import { PaymentStep } from './PaymentStep';
import { AgreementStep } from './AgreementStep';
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
  const [showAgreementScreen, setShowAgreementScreen] = useState(false);
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
    ipAddress: string | null;
    userAgent: string;
    agreementTextHash: string;
    timeSpentSeconds: number;
    scrollDepth: number;
  } | undefined>(undefined);
  const [formSettings, setFormSettings] = useState<FormSettings | null>(null);
  
  // Generate session ID when modal opens
  const [sessionId] = useState(() => {
    // Generate a unique session ID
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
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
        // Use default settings so form still works
        setFormSettings({
          emailEnabled: true,
          phoneEnabled: true,
          phoneVerificationEnabled: true,
          fullNameEnabled: true,
          ssnEnabled: true,
          bankAccountEnabled: true,
          agreementEnabled: true,
        });
      }
    };
    loadSettings();
  }, []);

  // Calculate total steps based on enabled fields
  const totalSteps = useMemo(() => {
    if (!formSettings) return 4; // Default while loading
    let steps = 0;
    if (formSettings.emailEnabled) steps++;
    if (formSettings.phoneEnabled) steps++;
    if (formSettings.fullNameEnabled) steps++;
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

  const needsBankAccount = useMemo(() => {
    const result = (creditTier === 'below-600' || plan.months >= 6) && formSettings?.bankAccountEnabled === true;
    console.log('🔍 needsBankAccount calculation:', {
      creditTier,
      planMonths: plan.months,
      bankAccountEnabled: formSettings?.bankAccountEnabled,
      result,
    });
    return result;
  }, [creditTier, plan.months, formSettings]);

  const handleNext = useCallback(() => {
    if (!formSettings) return; // Wait for settings to load
    
    // Calculate which field we're currently on
    let currentFieldStep = 0;
    let isOnEmail = false;
    let isOnPhone = false;
    let isOnFullName = false;
    let isOnSSN = false;
    
    if (formSettings.emailEnabled) {
      currentFieldStep++;
      if (step === currentFieldStep) {
        isOnEmail = true;
      }
    }
    
    if (formSettings.phoneEnabled) {
      currentFieldStep++;
      if (step === currentFieldStep) {
        isOnPhone = true;
      }
    }
    
    if (formSettings.fullNameEnabled) {
      currentFieldStep++;
      if (step === currentFieldStep) {
        isOnFullName = true;
      }
    }
    
    if (formSettings.ssnEnabled) {
      currentFieldStep++;
      if (step === currentFieldStep) {
        isOnSSN = true;
      }
    }
    
    // Handle navigation based on current field
    if (isOnEmail) {
      // After email, check if phone verification is needed
      if (formSettings.phoneEnabled && formSettings.phoneVerificationEnabled) {
        setShowPhoneVerification(true);
        return;
      }
      // Find next enabled field
      if (formSettings.phoneEnabled) {
        setStep(step + 1);
      } else if (formSettings.fullNameEnabled) {
        setStep(step + 1);
      } else if (formSettings.ssnEnabled) {
        setStep(step + 1);
      } else {
        // No more fields, go to bank/agreement
        if (needsBankAccount) {
          setShowBankAccountScreen(true);
        } else if (formSettings.agreementEnabled) {
          setShowAgreementScreen(true);
        } else {
          // No agreement, save and close immediately
          handleFinalSubmit();
        }
      }
      return;
    }
    
    if (isOnPhone) {
      // After phone, check if verification is needed
      if (formSettings.phoneVerificationEnabled) {
      setShowPhoneVerification(true);
        return;
      }
      // Find next enabled field
      if (formSettings.fullNameEnabled) {
        setStep(step + 1);
      } else if (formSettings.ssnEnabled) {
        setStep(step + 1);
      } else {
        // No more fields, go to bank account or payment
        if (needsBankAccount) {
          setShowBankAccountScreen(true);
        } else {
          // Go directly to payment screen
          setShowPaymentScreen(true);
        }
      }
      return;
    }
    
    if (isOnFullName) {
      // After name, find next enabled field
      if (formSettings.ssnEnabled) {
      setStep(step + 1);
    } else {
        // No more fields, go to bank/agreement/payment
        console.log('🚀 Navigating from fullName step. needsBankAccount:', needsBankAccount);
        if (needsBankAccount) {
          console.log('✅ Setting showBankAccountScreen to true');
          setShowBankAccountScreen(true);
        } else if (formSettings.agreementEnabled) {
          setShowAgreementScreen(true);
        } else {
          // No agreement, save and close immediately
          handleFinalSubmit();
        }
      }
      return;
    }
    
    if (isOnSSN) {
      // Last field, go to bank account or payment
      console.log('🚀 Navigating from SSN step. needsBankAccount:', needsBankAccount);
      if (needsBankAccount) {
        console.log('✅ Setting showBankAccountScreen to true');
        setShowBankAccountScreen(true);
      } else {
        // Go directly to payment screen
        setShowPaymentScreen(true);
      }
      return;
    }
  }, [step, formSettings, needsBankAccount, sessionId, formData, creditTier, plan, paymentFrequency]);

  const handlePhoneVerify = useCallback((code: string) => {
    // TODO: Verify code with backend API
    console.log('Verifying phone code:', code);
    // For now, just mark as verified
    setPhoneVerified(true);
    setShowPhoneVerification(false);
    
    // Find next enabled field
    if (formSettings?.fullNameEnabled) {
      // Calculate the step number for fullName
      let nameStep = 1;
      if (formSettings.emailEnabled) nameStep++;
      if (formSettings.phoneEnabled) nameStep++;
      setStep(nameStep);
    } else if (formSettings?.ssnEnabled) {
      // Calculate the step number for SSN
      let ssnStep = 1;
      if (formSettings.emailEnabled) ssnStep++;
      if (formSettings.phoneEnabled) ssnStep++;
      if (formSettings.fullNameEnabled) ssnStep++;
      setStep(ssnStep);
    } else {
      // No more fields, go to bank account or payment
      console.log('🚀 Navigating from phone verification. needsBankAccount:', needsBankAccount);
      if (needsBankAccount) {
        console.log('✅ Setting showBankAccountScreen to true');
        setShowBankAccountScreen(true);
      } else {
        // Go directly to payment screen
        setShowPaymentScreen(true);
      }
    }
  }, [sessionId, formData, creditTier, plan, paymentFrequency, formSettings, needsBankAccount]);

  const handleResendCode = useCallback(() => {
    // TODO: Resend verification code via backend API
    console.log('Resending verification code to:', formData.phone);
    // In a real implementation, you would call an API to resend the code
  }, [formData.phone]);

  const handleBankAccountNext = useCallback(() => {
    // Go to payment screen after bank account
    setShowPaymentScreen(true);
  }, []);
  
  const handleAgreementSign = useCallback(async (sigData: typeof signatureData) => {
    setSignatureData(sigData);
    // Save all data when agreement is signed
    startLoading();
    
    try {
      const result = await submitApplication({
        sessionId,
        email: formData.email,
        phone: formData.phone,
        fullName: formData.fullName,
        ssn: formData.ssn,
        creditTier,
        planMonths: plan.months,
        planPerPayment: plan.perPayment,
        planTotalPayments: plan.totalPayments,
        paymentFrequency,
        bankAccount: showBankAccountScreen ? {
          accountType: bankData.accountType,
          routingNumber: bankData.routingNumber,
          accountNumber: bankData.accountNumber,
        } : undefined,
        signature: sigData,
      });

      if (result.success) {
        console.log('✅ Application submitted successfully! Showing payment screen...');
        stopLoading();
        // Show payment screen where they can embed checkout
        setShowPaymentScreen(true);
      } else {
        stopLoading();
        setError(result.error || 'Failed to submit application');
        console.error('❌ Failed to submit application:', result.error);
      }
    } catch (err) {
      stopLoading();
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('❌ Error submitting application:', err);
    }
  }, [sessionId, formData, bankData, creditTier, plan, paymentFrequency, showBankAccountScreen, startLoading, stopLoading, setError]);
  
  const handleAgreementBack = useCallback(() => {
    // Go back to payment screen
    setShowPaymentScreen(true);
    setShowAgreementScreen(false);
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
    // This is only called if agreement is disabled - save all data immediately
    startLoading();
    
    try {
      const result = await submitApplication({
        sessionId,
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
        signature: signatureData,
      });

      if (result.success) {
        console.log('✅ Application submitted successfully! Redirecting to payment processor...');
        stopLoading();
        onClose();
        // TODO: Redirect to payment processor URL here
        // window.location.href = paymentProcessorUrl;
      } else {
        stopLoading();
        setError(result.error || 'Failed to submit application');
        console.error('❌ Failed to submit application:', result.error);
      }
    } catch (err) {
      stopLoading();
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('❌ Error submitting application:', err);
    }
  };

  const progressPercentage = useMemo(() => {
    if (showPaymentScreen) return 100;
    if (showAgreementScreen) return 90;
    if (showBankAccountScreen) return 80;
    if (showPhoneVerification) return 50; // Between step 2 and 3
    return (step / totalSteps) * 70;
  }, [showPaymentScreen, showAgreementScreen, showBankAccountScreen, showPhoneVerification, step, totalSteps]);

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

        {showAgreementScreen && formSettings?.agreementEnabled ? (
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
            <AgreementStep
              fullName={formData.fullName}
              email={formData.email}
              onSign={handleAgreementSign}
              onBack={handleAgreementBack}
            />
          </>
        ) : showPaymentScreen ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <div className="bg-[#141414] rounded-xl p-8 flex flex-col items-center gap-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-400">Processing...</p>
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
              onSubmit={() => {
                // After payment info is entered, go to agreement
                if (formSettings?.agreementEnabled) {
                  setShowAgreementScreen(true);
                } else {
                  // If agreement is disabled, save and close immediately
                  handleFinalSubmit();
                }
              }}
            />
          </>
        ) : showAgreementScreen && formSettings?.agreementEnabled ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <div className="bg-[#141414] rounded-xl p-8 flex flex-col items-center gap-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-400">Saving your application...</p>
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
            <AgreementStep
              fullName={formData.fullName}
              email={formData.email}
              onSign={handleAgreementSign}
              onBack={handleAgreementBack}
            />
          </>
        ) : showPhoneVerification && formSettings?.phoneVerificationEnabled ? (
          <PhoneVerificationStep
            phone={formData.phone}
            onVerify={handlePhoneVerify}
            onResend={handleResendCode}
          />
        ) : formSettings ? (
          <IdentityVerificationStep
            step={step}
            totalSteps={totalSteps}
            formData={formData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            needsBankAccount={needsBankAccount}
            formSettings={formSettings}
          />
        ) : (
          <div className="p-8 pt-16 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
    </div>
  );
}
