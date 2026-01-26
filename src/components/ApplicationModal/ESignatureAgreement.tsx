import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface ESignatureAgreementProps {
  fullName: string;
  onSign: (signatureData: {
    signatureName: string;
    signedAt: string;
    consentAgreed: boolean;
    agreementVersion: string;
  }) => void;
  onClose: () => void;
}

export function ESignatureAgreement({
  fullName,
  onSign,
  onClose,
}: ESignatureAgreementProps) {
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const agreementVersion = '1.0.0';
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
      setIsAtBottom(atBottom);
      
      // Also check on mount/initial load
      if (scrollHeight <= clientHeight) {
        setIsAtBottom(true);
      }
    };

    const content = contentRef.current;
    if (content) {
      handleScroll(); // Check immediately
      content.addEventListener('scroll', handleScroll);
      // Use ResizeObserver to detect content changes
      const resizeObserver = new ResizeObserver(handleScroll);
      resizeObserver.observe(content);
      
      return () => {
        content.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();
      };
    }
  }, []);

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleSign = () => {
    if (!consentAgreed || !signatureName.trim()) return;

    const signatureData = {
      signatureName: signatureName.trim(),
      signedAt: new Date().toISOString(),
      consentAgreed: true,
      agreementVersion,
    };

    onSign(signatureData);
  };

  const canSign = consentAgreed && signatureName.trim().length > 0 && isAtBottom;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6">
      <div className="bg-[#141414] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold">E-Signature Agreement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close agreement"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-3">E-Sign Consent Disclosure</h3>
              <p className="text-gray-300 leading-relaxed">
                You are signing this document electronically. You agree your electronic signature
                is the legal equivalent of your manual signature on this document.
              </p>
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-4 border border-gray-800">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="eSignConsent"
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <label
                  htmlFor="eSignConsent"
                  className="text-sm text-gray-300 leading-relaxed cursor-pointer"
                >
                  I agree to use electronic records and signatures. By checking this box, I consent
                  to conduct this transaction electronically. I understand that I may request a
                  paper copy of this agreement, but doing so may delay the processing of my
                  application.
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Terms of Service Agreement</h3>
              <div className="text-gray-300 space-y-4 leading-relaxed text-sm">
                <p>
                  <strong>Effective Date: {currentDate}</strong>
                </p>
                
                <p>
                  This Payment Plan Agreement ("Agreement") is entered into between you and Divvy
                  regarding the payment plan for the purchase of the Passion Product Accelerator.
                </p>

                <div>
                  <strong className="block mb-2">1. Payment Terms</strong>
                  <p>
                    You agree to make payments according to the schedule provided. Payments will be
                    automatically deducted from your designated payment method on the scheduled
                    dates. You authorize Divvy to charge your payment method for all amounts due
                    under this Agreement.
                  </p>
                </div>

                <div>
                  <strong className="block mb-2">2. Authorization for Automatic Payments</strong>
                  <p>
                    By signing this Agreement, you authorize Divvy to automatically charge your
                    payment method for all payments due under this payment plan. This authorization
                    will remain in effect until all payments have been made or until you notify
                    Divvy in writing to cancel this authorization.
                  </p>
                </div>

                <div>
                  <strong className="block mb-2">3. Late Payments</strong>
                  <p>
                    If a payment is not successfully processed on the scheduled date, you may be
                    subject to late fees. Divvy reserves the right to attempt to process the payment
                    again and may charge applicable fees.
                  </p>
                </div>

                <div>
                  <strong className="block mb-2">4. Credit Check</strong>
                  <p>
                    You authorize Divvy to obtain, use, and share consumer reports about you to
                    determine your eligibility for this payment plan. This may include credit
                    checks and verification of your identity.
                  </p>
                </div>

                <div>
                  <strong className="block mb-2">5. Privacy Policy</strong>
                  <p>
                    Your personal information will be handled in accordance with Divvy's Privacy
                    Policy. By signing this Agreement, you acknowledge that you have read and
                    understood the Privacy Policy.
                  </p>
                </div>

                <div>
                  <strong className="block mb-2">6. Entire Agreement</strong>
                  <p>
                    This Agreement constitutes the entire agreement between you and Divvy regarding
                    this payment plan. Any modifications must be made in writing and agreed upon by
                    both parties.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500">
                    By signing below, you acknowledge that you have read, understood, and agree to
                    be bound by the terms of this Agreement.
                  </p>
                </div>
              </div>
            </div>

            {!isAtBottom && (
              <button
                onClick={scrollToBottom}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Scroll to Continue
                <ChevronDown className="w-5 h-5" />
              </button>
            )}

            {isAtBottom && (
              <div className="border-t border-gray-800 pt-6 space-y-4">
                <div>
                  <label htmlFor="signatureName" className="block text-sm font-medium mb-2">
                    Type your full name to sign
                  </label>
                  <input
                    id="signatureName"
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder={fullName || 'Your full name'}
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    autoFocus
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    By typing your name, you are electronically signing this agreement
                  </p>
                </div>

                <button
                  onClick={handleSign}
                  disabled={!canSign}
                  className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
                >
                  Sign Agreement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
