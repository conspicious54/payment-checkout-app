import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface TermsOfServiceModalProps {
  onClose: () => void;
}

export function TermsOfServiceModal({ onClose }: TermsOfServiceModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#141414] rounded-2xl max-w-2xl w-full relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
          <h2 className="text-xl font-bold">Terms of Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={contentRef} className="overflow-y-auto p-6 space-y-6 text-sm text-gray-300 leading-relaxed">
          <p className="text-gray-500 text-xs">Last updated: March 2026</p>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">1. Agreement to Terms</h3>
            <p>
              These Terms of Service ("Terms") govern your use of the Divvy payment plan service ("Service") operated by Dopamine Solutions LLC ("Company," "we," "us," or "our") in connection with the Passion Product Accelerator program. By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">2. Eligibility</h3>
            <p>
              You must be at least 18 years of age and a legal resident of the United States to apply for a payment plan. By using this Service, you represent and warrant that you meet these requirements and that the information you provide is accurate and complete.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">3. Payment Plans</h3>
            <p className="mb-3">
              Dopamine Solutions LLC, through its Divvy service, offers installment payment plans for the purchase of the Passion Product Accelerator program. Available plan durations and associated payment amounts are displayed at the time of enrollment and may vary based on eligibility factors including credit assessment.
            </p>
            <p>
              All payment amounts, schedules, and total costs are disclosed prior to enrollment. By selecting a plan and completing the application process, you agree to the specific payment schedule presented to you.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">4. Refund Policy</h3>
            <p>
              A seven (7) day refund period applies beginning on the date of your first successful payment. After this period expires, your payment plan agreement becomes fully binding and non-cancelable. No refunds, reversals, or cancellations will be issued after the refund period, except as required by applicable law.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">5. Payment Authorization</h3>
            <p className="mb-3">
              By completing enrollment, you authorize Dopamine Solutions LLC to automatically charge your designated payment method for all scheduled installment payments until your balance is paid in full. This authorization includes the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Charge your primary payment method on each scheduled payment date</li>
              <li>Store your payment credentials securely for recurring billing</li>
              <li>Attempt collection via any backup payment method you have provided, including a linked bank account, in the event of a failed payment</li>
              <li>Re-attempt failed payments at reasonable intervals</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">6. Default and Collections</h3>
            <p className="mb-3">
              A payment is considered in default if it cannot be successfully collected within a reasonable retry period. In the event of default, Dopamine Solutions LLC reserves the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Suspend or terminate your access to the Passion Product Accelerator program</li>
              <li>Continue attempting to collect the outstanding balance using authorized payment methods</li>
              <li>Assess reasonable administrative fees associated with collection efforts, where permitted by law</li>
              <li>Forward your account to a third-party collections agency or pursue other lawful recovery methods</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">7. Chargebacks and Disputes</h3>
            <p>
              You agree not to initiate a chargeback or payment dispute except in cases of genuine fraud or billing error. Unauthorized chargebacks may result in a fee of up to $250 to cover administrative costs and processor penalties. Initiating a chargeback does not relieve you of your payment obligations.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">8. Identity Verification and Credit Checks</h3>
            <p>
              As part of the enrollment process, we may obtain consumer reports about you through one or more consumer reporting agencies for the purpose of identity verification and eligibility determination. Soft credit inquiries used for eligibility checking do not affect your credit score. Any hard inquiry, if applicable, will be disclosed prior to being performed.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">9. Electronic Signature and Records</h3>
            <p>
              You consent to the use of electronic records and signatures throughout this Service. Your typed signature on the payment plan agreement has the same legal effect as a handwritten signature under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and applicable state laws. You may request paper copies of any agreement by contacting us.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">10. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, Dopamine Solutions LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of this Service. Our total liability to you for any claim shall not exceed the amount you have paid to us in the 30 days preceding the claim.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">11. Governing Law</h3>
            <p>
              These Terms are governed by and construed in accordance with the laws of the United States and the state in which Dopamine Solutions LLC is registered, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">12. Changes to Terms</h3>
            <p>
              We reserve the right to update these Terms at any time. Material changes will be communicated to you via email or through the Service. Your continued use of the Service after such notice constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">13. Contact</h3>
            <p>
              Dopamine Solutions LLC<br />
              For questions about these Terms, please contact us through our website or via the contact information provided in your payment plan agreement.
            </p>
          </section>
        </div>

        <div className="p-4 border-t border-gray-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
