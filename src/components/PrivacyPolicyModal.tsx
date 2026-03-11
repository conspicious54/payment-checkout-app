import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
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
          <h2 className="text-xl font-bold">Privacy Policy</h2>
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
            <h3 className="text-white font-semibold text-base mb-2">1. About Us</h3>
            <p>
              This Privacy Policy applies to Dopamine Solutions LLC ("Company," "we," "us," or "our"), the company behind the Divvy payment plan service offered in connection with the Passion Product Accelerator program. By using our services, you agree to the collection and use of information as described in this policy.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">2. Information We Collect</h3>
            <p className="mb-3">We collect the following categories of personal information when you apply for a payment plan:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Contact information: name, email address, phone number</li>
              <li>Identity verification data: last 4 digits of your Social Security Number</li>
              <li>Payment information: debit/credit card details (card number, expiration, CVV, billing ZIP)</li>
              <li>Bank account information: account number, routing number, account type (when provided)</li>
              <li>Technical data: IP address, browser/device user agent, session identifiers</li>
              <li>Agreement metadata: e-signature timestamp, scroll depth, time spent reviewing agreement</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">3. How We Use Your Information</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>To verify your identity and determine eligibility for a payment plan</li>
              <li>To process and collect scheduled payments</li>
              <li>To send payment confirmations and account notifications</li>
              <li>To maintain legally required records of signed agreements</li>
              <li>To prevent fraud and comply with applicable laws</li>
              <li>To contact you regarding your account or payment obligations</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">4. Plaid Integration & Bank Account Data</h3>
            <p className="mb-3">
              We use <strong className="text-white">Plaid Inc.</strong> ("Plaid") to facilitate the secure connection of your bank account. When you choose to link a bank account through our application, you are also agreeing to Plaid's Privacy Policy, available at{' '}
              <span className="text-blue-400">https://plaid.com/legal/privacy-policy</span>.
            </p>
            <p className="mb-3">
              By connecting your bank account, you grant Dopamine Solutions LLC and Plaid the right to access, retrieve, and transmit your financial account data, including account balances, transaction history, and account identifiers, solely for the purpose of facilitating payment plan enrollment and payment collection.
            </p>
            <p className="mb-3">
              Plaid collects, stores, and processes your financial data on our behalf in accordance with their own privacy practices and applicable law. Dopamine Solutions LLC does not store your full bank account credentials. We receive only a tokenized account reference (Plaid account ID and public token) that allows us to initiate ACH debit transactions for scheduled payments.
            </p>
            <p>
              You may revoke Plaid's access to your financial data at any time through Plaid's data portal at{' '}
              <span className="text-blue-400">https://my.plaid.com</span>. However, revoking access does not relieve you of outstanding payment obligations under your signed agreement.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">5. Information Sharing</h3>
            <p className="mb-3">We do not sell your personal information. We may share your data with:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><strong className="text-white">Plaid Inc.</strong> — for bank account verification and ACH payment facilitation</li>
              <li><strong className="text-white">Payment processors</strong> — to process debit/credit card charges</li>
              <li><strong className="text-white">Consumer reporting agencies</strong> — as authorized in your signed payment plan agreement, for identity verification and eligibility checks</li>
              <li><strong className="text-white">Collection agencies</strong> — in the event of default, as permitted by applicable law</li>
              <li><strong className="text-white">Legal or regulatory authorities</strong> — when required to comply with a legal obligation</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">6. Data Retention</h3>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes described in this policy, to maintain records required by law, or to enforce our agreements. E-signature records and payment records are retained for a minimum of 7 years as required for legal and audit purposes.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">7. Security</h3>
            <p>
              We use industry-standard encryption (TLS/SSL) to protect data in transit. Sensitive data such as SSN digits and bank account numbers are handled with restricted access controls. We do not store CVV/CVC codes after payment processing. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">8. Your Rights</h3>
            <p className="mb-3">Depending on your location, you may have rights to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data, subject to legal retention requirements</li>
              <li>Opt out of certain data sharing, where permitted</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at the address below.</p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">9. Contact Us</h3>
            <p>
              Dopamine Solutions LLC<br />
              For privacy inquiries, please contact us through our website or via the contact information provided in your payment plan agreement.
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
