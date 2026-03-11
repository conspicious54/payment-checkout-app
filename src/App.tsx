import { useState, useMemo, useCallback, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { PaymentFrequencyToggle } from './components/PaymentFrequencyToggle';
import { PlanSelector } from './components/PlanSelector';
import { PaymentSummary } from './components/PaymentSummary';
import { PaymentScheduleModal } from './components/PaymentScheduleModal';
import { ApplicationModal } from './components/ApplicationModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { CreditTier, PaymentFrequency, PaymentPlan } from './constants';
import { creditTierPlans } from './constants';
import { adjustPlanForFrequency, calculateTotalAmount } from './utils/paymentCalculations';
import { generatePaymentDates } from './utils/dateUtils';
import { fetchAllPaymentPlans } from './utils/supabase';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsOfServiceModal } from './components/TermsOfServiceModal';

function App() {
  const [creditTier, setCreditTier] = useState<CreditTier>('700+');
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly');
  const [plansByTier, setPlansByTier] = useState<Record<CreditTier, PaymentPlan[]>>(creditTierPlans);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Fetch plans from database on mount
  useEffect(() => {
    const loadPlans = async () => {
      setIsLoadingPlans(true);
      const dbPlans = await fetchAllPaymentPlans();
      if (dbPlans) {
        setPlansByTier(dbPlans);
      }
      // If database fetch fails, we'll use the fallback from constants
      setIsLoadingPlans(false);
    };
    loadPlans();
  }, []);

  const plans = useMemo(() => plansByTier[creditTier], [plansByTier, creditTier]);
  const basePlan = useMemo(() => plans[selectedPlanIndex], [plans, selectedPlanIndex]);

  const selectedPlan = useMemo(
    () => adjustPlanForFrequency(basePlan, paymentFrequency),
    [basePlan, paymentFrequency]
  );
  
  const totalAmount = useMemo(
    () => calculateTotalAmount(selectedPlan),
    [selectedPlan]
  );
  
  const paymentDates = useMemo(
    () => generatePaymentDates(selectedPlan.totalPayments, paymentFrequency),
    [selectedPlan.totalPayments, paymentFrequency]
  );

  const handleCreditTierChange = useCallback((tier: CreditTier) => {
    setCreditTier(tier);
    setSelectedPlanIndex(0);
  }, []);

  const handleScheduleClick = useCallback(() => {
    setShowScheduleModal(true);
  }, []);

  const handleApplicationClick = useCallback(() => {
    setShowApplicationModal(true);
  }, []);

  const handleScheduleClose = useCallback(() => {
    setShowScheduleModal(false);
  }, []);

  const handleApplicationClose = useCallback(() => {
    setShowApplicationModal(false);
  }, []);

  if (isLoadingPlans) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-400">Loading payment plans...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
          <Header creditTier={creditTier} onCreditTierChange={handleCreditTierChange} />

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-5xl font-bold mb-8">Pay over time</h2>
            <p className="text-gray-400 text-lg mb-6">Choose your plan duration</p>

              <PaymentFrequencyToggle
                frequency={paymentFrequency}
                onFrequencyChange={setPaymentFrequency}
              />

              <PlanSelector
                plans={plans}
                selectedPlanIndex={selectedPlanIndex}
                paymentFrequency={paymentFrequency}
                onPlanSelect={setSelectedPlanIndex}
              />
            </div>

            <PaymentSummary
              plan={selectedPlan}
              paymentFrequency={paymentFrequency}
              onScheduleClick={handleScheduleClick}
              onApplicationClick={handleApplicationClick}
            />
        </div>
      </div>

      {showScheduleModal && (
        <PaymentScheduleModal
          plan={selectedPlan}
          dates={paymentDates}
          totalAmount={totalAmount}
          frequency={paymentFrequency}
            onClose={handleScheduleClose}
        />
      )}

      {showApplicationModal && (
        <ApplicationModal
          plan={selectedPlan}
          creditTier={creditTier}
            paymentFrequency={paymentFrequency}
            onClose={handleApplicationClose}
          />
        )}

      {showPrivacyPolicy && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />
      )}

      {showTerms && (
        <TermsOfServiceModal onClose={() => setShowTerms(false)} />
      )}

      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Dopamine Solutions LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setShowTerms(true)}
              className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
