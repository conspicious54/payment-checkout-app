import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Download } from 'lucide-react';

interface AgreementStepProps {
  fullName: string;
  email: string;
  onSign: (signatureData: {
    signatureName: string;
    signedAt: string;
    consentAgreed: boolean;
    agreementVersion: string;
    ipAddress: string | null;
    userAgent: string;
    agreementTextHash: string;
    timeSpentSeconds: number;
    scrollDepth: number;
  }) => void;
  onBack: () => void;
}

// Agreement text - this is what they're signing
const AGREEMENT_TEXT = `TERMS OF SERVICE & PAYMENT PLAN AGREEMENT

This Payment Plan Agreement ("Agreement") is entered into between Divvy ("Company," "we," "us," or "our") and the undersigned customer ("you" or "Customer") in connection with the purchase of the Passion Product Accelerator ("Program").

1. Refund Period and Binding Effect

You acknowledge and agree that a seven (7) day refund period applies to this purchase, which begins immediately upon successful collection of the first payment.

After the expiration of the 7-day refund period:

This Agreement becomes fully binding and non-cancelable.

You are obligated to complete all installment payments according to the agreed-upon payment schedule.

No refunds, chargebacks, reversals, or payment diversions are permitted except as required by law.

2. Payment Authorization and Installment Obligations

You agree to pay the full purchase price of the Program through the installment plan you selected at checkout.

By signing this Agreement, you expressly authorize Divvy to:

Automatically charge your primary payment method for all scheduled installment payments.

Store your payment credentials securely for future billing attempts.

Continue billing until the balance is paid in full.

Failure to complete any installment does not cancel or void your obligation to pay the remaining balance.

3. Backup Payment Authorization (Bank Account / Alternative Methods)

If a scheduled payment fails for any reason (including insufficient funds, card expiration, declines, or account closure), you authorize Divvy to:

Attempt collection using any backup payment method you have provided, including a linked bank account (ACH debit), debit card, or alternate card on file.

Reattempt failed payments at reasonable intervals until successfully collected.

You agree not to revoke this authorization while any balance remains outstanding.

4. Default, Failed Payments, and Remedies

A payment is considered in default if it is not successfully collected within a reasonable retry period.

In the event of default, Divvy reserves the right to:

Suspend or terminate your access to the Program.

Continue attempting to collect the outstanding balance using authorized payment methods.

Assess reasonable administrative fees associated with collection efforts, where permitted by law.

5. Chargebacks and Payment Diversion

You agree not to initiate a chargeback, payment dispute, or payment diversion for any reason other than a legitimate billing error or fraud.

If you initiate a chargeback or dispute without a legitimate basis, you agree that:

Divvy may assess a chargeback fee of up to $250, representing administrative costs, processor penalties, and time spent responding to the dispute.

This fee is in addition to any outstanding balance owed.

Chargebacks do not relieve you of your payment obligations under this Agreement.

6. Collections and Recovery

If payment obligations remain unpaid after reasonable internal collection efforts, you agree that Divvy may:

Forward your account to a third-party collections agency or pursue other lawful recovery methods.

Report the delinquency where legally permitted.

Seek recovery of the outstanding balance, permitted fees, and reasonable costs of collection.

You remain responsible for the full balance until paid in full.

7. No Waiver

Failure by Divvy to enforce any provision of this Agreement at any time does not waive our right to enforce that provision or any other provision in the future.

8. Entire Agreement

This Agreement constitutes the entire agreement between you and Divvy regarding the payment plan and supersedes all prior communications or understandings. Any modification must be in writing and agreed to by both parties.`;

// Simple hash function for agreement text (for legal proof)
async function hashAgreementText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AgreementStep({
  fullName,
  email,
  onSign,
  onBack,
}: AgreementStepProps) {
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const agreementVersion = '2.0.0'; // Updated version for new terms

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Track time spent on agreement
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const scrollDepth = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
      setMaxScrollDepth(prev => Math.max(prev, scrollDepth));
      
      const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
      setIsAtBottom(atBottom);
      
      if (scrollHeight <= clientHeight) {
        setIsAtBottom(true);
      }
    };

    const content = contentRef.current;
    if (content) {
      handleScroll();
      content.addEventListener('scroll', handleScroll);
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

  // Get IP address (client-side attempt, but should be server-side in production)
  const getIPAddress = async (): Promise<string | null> => {
    try {
      // Try to get IP from a service (for legal purposes)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || null;
    } catch {
      // Fallback - in production, capture this server-side
      return null;
    }
  };

  const handleSign = async () => {
    if (!consentAgreed || !signatureName.trim()) return;

    // Generate agreement text hash for legal proof
    const agreementHash = await hashAgreementText(AGREEMENT_TEXT);
    
    // Get IP address
    const ipAddress = await getIPAddress();
    
    // Get user agent
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

    const signatureData = {
      signatureName: signatureName.trim(),
      signedAt: new Date().toISOString(),
      consentAgreed: true,
      agreementVersion,
      ipAddress,
      userAgent,
      agreementTextHash: agreementHash,
      timeSpentSeconds: timeSpent,
      scrollDepth: maxScrollDepth,
    };

    onSign(signatureData);
  };

  const canSign = consentAgreed && signatureName.trim().length > 0 && isAtBottom && maxScrollDepth >= 90;

  const handleDownloadAgreement = () => {
    const blob = new Blob([AGREEMENT_TEXT], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Divvy_Payment_Plan_Agreement_${currentDate.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 pt-16">
      <div className="flex items-center justify-center mb-8">
        <img src="/Logo-E1.png" alt="Divvy" className="h-8" />
      </div>

      <div className="text-center mb-8">
        <div className="text-sm text-gray-400 mb-2">E-SIGNATURE AGREEMENT</div>
        <h2 className="text-3xl font-bold mb-4">Review and Sign</h2>
        <p className="text-gray-400">
          Please carefully review the agreement below. You must scroll to the bottom and provide your electronic signature to continue.
        </p>
        <button
          onClick={handleDownloadAgreement}
          className="mt-4 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 mx-auto"
        >
          <Download className="w-4 h-4" />
          Download Agreement (PDF/TXT)
        </button>
      </div>

      <div
        ref={contentRef}
        className="bg-[#0a0a0a] rounded-xl p-6 mb-6 max-h-96 overflow-y-auto border border-gray-800"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-3">E-Sign Consent Disclosure</h3>
            <p className="text-gray-300 leading-relaxed text-sm mb-4">
              You are signing this document electronically. You agree your electronic signature
              is the legal equivalent of your manual signature on this document. By signing electronically,
              you acknowledge that you have read, understood, and agree to be bound by all terms and conditions
              set forth in this Agreement.
            </p>
            <p className="text-gray-300 leading-relaxed text-sm mb-4">
              <strong>Legal Effect:</strong> This electronic signature has the same legal force and effect
              as a handwritten signature. You may request a paper copy of this agreement at any time by
              contacting us, but doing so may delay the processing of your application.
            </p>
            <p className="text-gray-300 leading-relaxed text-sm">
              <strong>Agreement Version:</strong> {agreementVersion} | <strong>Date:</strong> {currentDate}
            </p>
          </div>

          <div className="bg-[#141414] rounded-lg p-4 border border-gray-800">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="eSignConsent"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                required
              />
              <label
                htmlFor="eSignConsent"
                className="text-sm text-gray-300 leading-relaxed cursor-pointer"
              >
                <strong>I consent to use electronic records and signatures.</strong> By checking this box,
                I acknowledge that: (1) I have the ability to access and retain this agreement electronically;
                (2) I consent to conduct this transaction electronically; (3) My electronic signature has
                the same legal effect as a handwritten signature; (4) I have read and understand all terms
                of this Agreement; and (5) I agree to be bound by all terms and conditions.
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-xl font-semibold mb-4">TERMS OF SERVICE & PAYMENT PLAN AGREEMENT</h3>
            <div className="text-gray-300 space-y-4 leading-relaxed text-sm whitespace-pre-line">
              {AGREEMENT_TEXT}
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
        </div>
      </div>

      {isAtBottom && (
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              <strong>Legal Notice:</strong> By typing your full legal name below, you are creating a legally
              binding electronic signature. This signature will be recorded with a timestamp, IP address,
              and other identifying information for legal and audit purposes.
            </p>
          </div>

          <div>
            <label htmlFor="signatureName" className="block text-sm font-medium mb-2">
              Type your full legal name to sign this agreement
            </label>
            <input
              id="signatureName"
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder={fullName || 'Your full legal name'}
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
              required
            />
            <p className="text-gray-500 text-xs mt-2">
              Enter your full legal name to sign this agreement.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 rounded-xl transition-all"
            >
              Back
            </button>
            <button
              onClick={handleSign}
              disabled={!canSign}
              className="flex-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
            >
              Sign & Continue
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center">
            Time spent reviewing: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s | 
            Scroll depth: {maxScrollDepth}%
          </p>
        </div>
      )}
    </div>
  );
}
