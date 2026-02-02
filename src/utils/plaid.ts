/**
 * Plaid Integration Utilities
 * 
 * For sandbox/demo mode, you can use Plaid's sandbox credentials.
 * In production, you'll need a backend endpoint to securely create Link tokens.
 * 
 * Sandbox credentials can be obtained from: https://dashboard.plaid.com/developers/keys
 */

export interface PlaidAccount {
  account_id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
}

export interface PlaidAccountData {
  accountId: string;
  accountName: string;
  accountMask: string;
  accountType: string;
  accountSubtype: string;
  routingNumber?: string;
  accountNumber?: string;
}

/**
 * Extract bank account information from Plaid Link success response
 * Note: In production, you should exchange the public_token for an access_token
 * on your backend and then retrieve account details securely.
 */
export function extractBankAccountFromPlaid(
  _publicToken: string,
  metadata: {
    institution?: {
      name: string;
      institution_id: string;
    } | null;
    accounts: Array<{
      id: string;
      name: string;
      mask: string;
      type: string;
      subtype: string;
    }>;
  }
): PlaidAccountData | null {
  if (!metadata.accounts || metadata.accounts.length === 0) {
    return null;
  }

  // For demo purposes, we'll use the first account
  // In production, you might want to let the user select which account
  const account = metadata.accounts[0];

  return {
    accountId: account.id,
    accountName: account.name,
    accountMask: account.mask,
    accountType: account.type,
    accountSubtype: account.subtype,
    // Note: routingNumber and accountNumber are not available directly from Link
    // You'll need to exchange the public_token for an access_token on your backend
    // and then use the Accounts API to get full account details
  };
}

/**
 * Map Plaid account type to our internal account type
 */
export function mapPlaidAccountType(plaidType: string, plaidSubtype: string): 'checking' | 'savings' {
  const normalizedSubtype = plaidSubtype?.toLowerCase() || '';
  const normalizedType = plaidType?.toLowerCase() || '';
  
  if (normalizedSubtype.includes('checking') || normalizedType.includes('depository')) {
    // Most depository accounts with checking subtype are checking accounts
    if (normalizedSubtype.includes('checking')) {
      return 'checking';
    }
    // Default to checking for general depository accounts
    return 'checking';
  }
  
  if (normalizedSubtype.includes('savings')) {
    return 'savings';
  }
  
  // Default to checking
  return 'checking';
}
