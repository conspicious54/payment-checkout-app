import { useState, useEffect, useRef } from 'react';

interface PhoneVerificationStepProps {
  phone: string;
  onVerify: (code: string) => void;
  onResend: () => void;
}

export function PhoneVerificationStep({
  phone,
  onVerify,
  onResend,
}: PhoneVerificationStepProps) {
  const [code, setCode] = useState('');
  const [resendEnabled, setResendEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start countdown timer
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setResendEnabled(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleCodeChange = (value: string) => {
    // Only allow digits, max 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
  };

  const handleResend = () => {
    setCode('');
    setResendEnabled(false);
    setTimeRemaining(60);
    onResend();
    
    // Restart timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setResendEnabled(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = () => {
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      e.preventDefault();
      handleVerify();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      handleVerify();
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-8 pt-16">
      <div className="flex items-center justify-center mb-8">
        <img src="/divvylogo.png" alt="Divvy" className="h-8" />
      </div>

      <div className="text-center mb-8">
        <div className="text-sm text-gray-400 mb-2">VERIFY IDENTITY</div>
        <h2 className="text-3xl font-bold mb-4">Verify Your Phone Number</h2>
        <p className="text-gray-400">
          We sent a verification code to{' '}
          <span className="text-white font-medium">{formatPhoneNumber(phone)}</span>
        </p>
      </div>

      <div className="mb-8">
        <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
          VERIFICATION CODE
        </label>
        <input
          id="verificationCode"
          type="text"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="000000"
          maxLength={6}
          className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-2xl tracking-widest text-center font-mono"
          autoFocus
          aria-label="Enter 6-digit verification code"
        />
        <p className="text-gray-500 text-sm mt-2 text-center">
          Enter the 6-digit code sent to your phone
        </p>
      </div>

      <button
        onClick={handleVerify}
        disabled={code.length !== 6}
        className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-4 rounded-xl transition-all disabled:cursor-not-allowed mb-4"
        aria-label="Verify code"
      >
        Verify Code
      </button>

      <div className="text-center">
        <p className="text-gray-500 text-sm mb-2">
          Didn't receive a code?
        </p>
        {resendEnabled ? (
          <button
            onClick={handleResend}
            className="text-blue-500 hover:text-blue-400 font-medium text-sm transition-colors"
            aria-label="Resend verification code"
          >
            Resend Code
          </button>
        ) : (
          <p className="text-gray-500 text-sm">
            Resend code in {timeRemaining}s
          </p>
        )}
      </div>

      <p className="text-gray-500 text-xs text-center mt-6 leading-relaxed">
        By continuing, I agree to Divvy's Terms of Service, E-Sign Consent, and Privacy Policy
        and authorize Divvy to obtain, use, and share consumer reports about me.
      </p>
    </form>
  );
}
