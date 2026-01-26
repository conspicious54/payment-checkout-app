import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// TODO: Replace with your actual Supabase URL and anon key
// You can get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Application submission interface
export interface ApplicationData {
  email: string;
  phone: string;
  fullName: string;
  ssn: string;
  creditTier: string;
  planMonths: number;
  planPerPayment: number;
  planTotalPayments: number;
  paymentFrequency: string;
  bankAccount?: {
    accountType: string;
    routingNumber: string;
    accountNumber: string;
  };
  paymentCard?: {
    cardNumber: string; // Should be encrypted in production
    expDate: string;
    cvv: string; // Should never be stored - only for processing
    zipCode: string;
  };
  signature?: {
    signatureName: string;
    signedAt: string;
    consentAgreed: boolean;
    agreementVersion: string;
  };
}

/**
 * Submit application data to Supabase
 * @param data - Application data
 * @returns Success status and any error message
 */
export async function submitApplication(data: ApplicationData): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!supabase) {
    console.warn('Supabase not configured. Application data:', data);
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // In production, you should:
    // 1. Encrypt sensitive data (SSN, bank account, card number)
    // 2. Use Row Level Security (RLS) policies
    // 3. Store payment info securely (use a payment processor like Stripe)
    // 4. Never store CVV
    
    const { error } = await supabase.from('applications').insert({
      email: data.email,
      phone: data.phone,
      full_name: data.fullName,
      ssn_last_4: data.ssn,
      credit_tier: data.creditTier,
      plan_months: data.planMonths,
      plan_per_payment: data.planPerPayment,
      plan_total_payments: data.planTotalPayments,
      payment_frequency: data.paymentFrequency,
      bank_account_type: data.bankAccount?.accountType,
      bank_routing_number: data.bankAccount?.routingNumber,
      bank_account_number: data.bankAccount?.accountNumber,
      // Note: In production, card details should be processed through a payment gateway
      // and only store a token/reference, not the actual card number
      card_last_4: data.paymentCard?.cardNumber.slice(-4),
      card_exp_date: data.paymentCard?.expDate,
      card_zip: data.paymentCard?.zipCode,
      // E-Signature data (required for compliance)
      signature_name: data.signature?.signatureName,
      signature_signed_at: data.signature?.signedAt,
      signature_consent_agreed: data.signature?.consentAgreed,
      signature_agreement_version: data.signature?.agreementVersion,
      // Additional metadata for e-signature compliance
      ip_address: null, // Should be captured server-side
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Application submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
