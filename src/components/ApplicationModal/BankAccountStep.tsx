import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess, PlaidLinkOnExit } from 'react-plaid-link';
import { extractBankAccountFromPlaid, mapPlaidAccountType } from '../../utils/plaid';

interface BankAccountStepProps {
  bankData: {
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
    plaidAccountId?: string;
    plaidPublicToken?: string;
  };
  onBankDataChange: (data: {
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
    plaidAccountId?: string;
    plaidPublicToken?: string;
  }) => void;
  onNext: () => void;
}

/**
 * Get Plaid Link token
 * 
 * In production, this should call your backend endpoint to create a Link token securely.
 * For demo/sandbox, you can use a backend endpoint that creates a token using Plaid's API.
 * 
 * Example backend endpoint (Node.js):
 * ```javascript
 * const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
 * 
 * const configuration = new Configuration({
 *   basePath: PlaidEnvironments.sandbox, // or production
 *   baseOptions: {
 *     headers: {
 *       'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
 *       'PLAID-SECRET': process.env.PLAID_SECRET,
 *     },
 *   },
 * });
 * 
 * const plaidClient = new PlaidApi(configuration);
 * 
 * app.post('/api/plaid/create-link-token', async (req, res) => {
 *   const response = await plaidClient.linkTokenCreate({
 *     user: { client_user_id: req.body.userId },
 *     client_name: 'Divvy',
 *     products: ['auth'],
 *     country_codes: ['US'],
 *     language: 'en',
 *   });
 *   res.json({ link_token: response.data.link_token });
 * });
 * ```
 */
async function getPlaidLinkToken(): Promise<string | null> {
  // Use Netlify function endpoint
  // In development, this will fail unless you're running netlify dev
  // In production, this will work after deploying to Netlify
  const netlifyFunctionUrl = '/.netlify/functions/create-link-token';
  
  try {
    console.log('🔗 Fetching Plaid Link token from:', netlifyFunctionUrl);
    const response = await fetch(netlifyFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: `user-${Date.now()}` }),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to create Link token' };
      }
      
      // If 404, Netlify functions aren't available (likely local dev)
      if (response.status === 404) {
        console.warn('⚠️ Netlify function not found. This is normal in local development.');
        console.warn('💡 To test locally, run: npx netlify dev');
        console.warn('💡 Or deploy to Netlify to use the functions in production.');
        throw new Error('Netlify functions not available. Please deploy to Netlify or run "netlify dev" locally.');
      }
      
      throw new Error(errorData.error || 'Failed to create Link token');
    }

    const data = await response.json();
    console.log('✅ Link token received:', data.link_token ? 'Token received' : 'No token');
    return data.link_token || null;
  } catch (error) {
    console.error('❌ Error fetching Link token from Netlify function:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return null;
  }
}

export function BankAccountStep({
  bankData,
  onBankDataChange,
  onNext,
}: BankAccountStepProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAdvancedRef = useRef(false);
  const onNextRef = useRef(onNext);

  // Keep the ref updated
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  // Fetch Plaid Link token on mount
  useEffect(() => {
    async function fetchLinkToken() {
      setIsLoadingToken(true);
      setError(null);
      try {
        const token = await getPlaidLinkToken();
        if (token) {
          setLinkToken(token);
        } else {
          setError('Unable to initialize bank connection. Please contact support.');
        }
      } catch (err) {
        console.error('Error fetching Plaid Link token:', err);
        setError('Failed to initialize bank connection. Please try again.');
      } finally {
        setIsLoadingToken(false);
      }
    }

    fetchLinkToken();
  }, []);

  // Auto-advance when Plaid connection is successful
  useEffect(() => {
    if (plaidConnected && bankData.plaidAccountId && !hasAdvancedRef.current) {
      hasAdvancedRef.current = true;
      const timer = setTimeout(() => {
          onNextRef.current();
      }, 1000); // Give user a moment to see success message
      return () => clearTimeout(timer);
    }
  }, [plaidConnected, bankData.plaidAccountId]);

  const onSuccess: PlaidLinkOnSuccess = (publicToken, metadata) => {
    console.log('Plaid Link success:', { publicToken, metadata });
    
    try {
      const accountData = extractBankAccountFromPlaid(publicToken, {
        institution: metadata.institution ? {
          name: metadata.institution.name,
          institution_id: metadata.institution.institution_id,
        } : null,
        accounts: metadata.accounts,
      });
      
      if (!accountData) {
        setError('No account information received from Plaid. Please try again.');
        return;
      }

      // Map Plaid account type to our format
      const accountType = mapPlaidAccountType(accountData.accountType, accountData.accountSubtype);

      // Update bank data with Plaid information
      // Note: For full account/routing numbers, you'll need to exchange the public_token
      // for an access_token on your backend and use Plaid's Accounts API
      onBankDataChange({
        accountNumber: accountData.accountMask || '', // Mask is available, full number requires backend
        routingNumber: '', // Will be retrieved via backend API
        accountType,
        plaidAccountId: accountData.accountId,
        plaidPublicToken: publicToken,
      });

      setPlaidConnected(true);
      setError(null);

      // Exchange public_token for access_token and get full account details
      fetch('/.netlify/functions/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken }),
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to exchange token');
          }
          return res.json();
        })
        .then(data => {
          if (data.routing_number && data.account_number) {
            onBankDataChange({
              accountNumber: data.account_number,
              routingNumber: data.routing_number,
              accountType: mapPlaidAccountType(data.account_type, data.account_subtype),
              plaidAccountId: data.account_id,
              plaidPublicToken: publicToken,
            });
          }
        })
        .catch(err => {
          console.error('Error exchanging Plaid token:', err);
          // Continue anyway - we have the account ID and mask
        });
    } catch (err) {
      console.error('Error processing Plaid response:', err);
      setError('Failed to process bank account information. Please try again.');
    }
  };

  const onExit: PlaidLinkOnExit = (err, metadata) => {
    if (err) {
      console.error('Plaid Link error:', err);
      setError(err.error_message || err.error_code || 'An error occurred while connecting your bank account.');
    } else if (metadata?.status === 'requires_credentials') {
      setError('Please enter your bank credentials to continue.');
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  });

  const handleConnectBank = () => {
    if (ready && linkToken) {
      open();
    } else {
      setError('Bank connection is not ready. Please wait a moment and try again.');
    }
  };

  if (isLoadingToken) {
    return (
      <div className="p-8 pt-16">
        <div className="flex items-center justify-center mb-8">
          <img src="/Logo-E1.png" alt="Divvy" className="h-8 brightness-0 invert" />
        </div>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Initializing bank connection...</p>
        </div>
      </div>
    );
  }

  if (plaidConnected && bankData.plaidAccountId) {
    return (
      <div className="p-8 pt-16">
        <div className="flex items-center justify-center mb-8">
          <img src="/Logo-E1.png" alt="Divvy" className="h-8 brightness-0 invert" />
        </div>

        <div className="text-center mb-8">
          <div className="text-sm text-gray-400 mb-2">CONNECT BANK ACCOUNT</div>
          <h2 className="text-3xl font-bold mb-4">Bank Account Connected</h2>
        </div>

        <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div className="flex-1">
              <p className="text-green-400 font-medium">Successfully Connected</p>
              <p className="text-gray-400 text-sm mt-1">
                Your bank account has been securely linked via Plaid.
              </p>
            </div>
          </div>
          {bankData.accountNumber && (
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <p className="text-xs text-gray-500 mb-1">Account ending in:</p>
              <p className="text-gray-300 font-mono">****{bankData.accountNumber.slice(-4)}</p>
            </div>
          )}
        </div>

        <div className="bg-[#0a0a0a] rounded-xl p-4 mb-6 border border-yellow-900/30">
          <div className="flex gap-3">
            <div className="text-yellow-500 mt-0.5" aria-hidden="true">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-300 font-medium mb-1">Bank-Level Security</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your bank information is encrypted and secured through Plaid's bank-level encryption.
                Your credentials are never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mb-6">
          Continuing to payment information...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 pt-16">
      <div className="flex items-center justify-center mb-8">
        <img src="/Logo-E1.png" alt="Divvy" className="h-8 brightness-0 invert" />
      </div>

      <div className="text-center mb-8">
        <div className="text-sm text-gray-400 mb-2">CONNECT BANK ACCOUNT</div>
        <h2 className="text-3xl font-bold mb-4">Link Your Bank Account</h2>
        <p className="text-gray-400">
          For your payment plan, we need to verify your bank account for automatic payments.
          Connect securely through Plaid - your credentials are never shared with us.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm font-medium mb-2">Connection Error</p>
          <p className="text-red-300 text-xs">{error}</p>
          <p className="text-gray-400 text-xs mt-2">
            {!linkToken && (
              <>
                <strong>Note:</strong> Netlify functions only work when deployed to Netlify or when running locally with <code className="bg-gray-800 px-1 rounded">netlify dev</code>.
                Make sure you've set the Plaid environment variables in Netlify and redeployed.
              </>
            )}
          </p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <button
          onClick={handleConnectBank}
          disabled={!ready || !linkToken}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-4 rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <Lock className="w-5 h-5" />
          {!linkToken ? 'Waiting for connection...' : ready ? 'Connect Bank Account with Plaid' : 'Initializing...'}
        </button>
        
        <button
          onClick={onNext}
          className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
        >
          Skip for now →
        </button>

        <div className="bg-[#0a0a0a] rounded-xl p-4 border border-blue-900/30">
          <div className="flex gap-3">
            <div className="text-blue-500 mt-0.5" aria-hidden="true">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-300 font-medium mb-1">Secure Connection</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Plaid uses bank-level encryption to securely connect your account. Your login
                credentials are never stored on our servers and are only used to verify your account.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-600">
            By connecting your account, you agree to Plaid's{' '}
            <a
              href="https://plaid.com/legal/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 underline"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="https://plaid.com/legal/#end-user-privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 underline"
            >
              Privacy Policy
            </a>
            .
            </p>
          </div>
        </div>
      </div>
  );
}
