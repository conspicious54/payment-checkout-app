import { createClient } from '@supabase/supabase-js';
import type { PaymentPlan, CreditTier } from '../constants';

// Initialize Supabase client
// TODO: Replace with your actual Supabase URL and anon key
// You can get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database Payment Plan interface
interface DatabasePaymentPlan {
  id: string;
  credit_tier: CreditTier;
  months: number;
  base_amount: number;
  interest_rate: number;
  per_payment: number;
  total_payments: number;
  total_amount: number;
  is_active: boolean;
  display_order: number;
}

/**
 * Fetch payment plans from database for a specific credit tier
 * @param creditTier - The credit tier to fetch plans for
 * @returns Array of payment plans or null if error
 */
export async function fetchPaymentPlans(creditTier: CreditTier): Promise<PaymentPlan[] | null> {
  if (!supabase) {
    console.warn('Supabase not configured. Using fallback plans.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('credit_tier', creditTier)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching payment plans:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn(`No active payment plans found for credit tier: ${creditTier}`);
      return null;
    }

    // Transform database format to application format
    return data.map((plan: DatabasePaymentPlan) => ({
      months: plan.months,
      perPayment: plan.per_payment,
      totalPayments: plan.total_payments,
    }));
  } catch (error) {
    console.error('Exception fetching payment plans:', error);
    return null;
  }
}

// Form Settings interface
export interface FormSettings {
  emailEnabled: boolean;
  phoneEnabled: boolean;
  phoneVerificationEnabled: boolean;
  fullNameEnabled: boolean;
  ssnEnabled: boolean;
  bankAccountEnabled: boolean;
  agreementEnabled: boolean;
}

/**
 * Fetch form settings from database
 * @returns Form settings object or null if error
 */
export async function fetchFormSettings(): Promise<FormSettings | null> {
  if (!supabase) {
    console.warn('Supabase not configured. Using default form settings.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('form_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.error('Error fetching form settings:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn('No form settings found. Using defaults.');
      return null;
    }

    console.log('Raw form settings from database:', data);

    // Convert array to object with default values
    const settings: FormSettings = {
      emailEnabled: true,
      phoneEnabled: true,
      phoneVerificationEnabled: true,
      fullNameEnabled: true,
      ssnEnabled: true,
      bankAccountEnabled: true,
      agreementEnabled: true,
    };

    data.forEach((item: { setting_key: string; setting_value: boolean }) => {
      switch (item.setting_key) {
        case 'email_enabled':
          settings.emailEnabled = item.setting_value;
          break;
        case 'phone_enabled':
          settings.phoneEnabled = item.setting_value;
          break;
        case 'phone_verification_enabled':
          settings.phoneVerificationEnabled = item.setting_value;
          break;
        case 'full_name_enabled':
          settings.fullNameEnabled = item.setting_value;
          break;
        case 'ssn_enabled':
          settings.ssnEnabled = item.setting_value;
          break;
        case 'bank_account_enabled':
          settings.bankAccountEnabled = item.setting_value;
          break;
        case 'agreement_enabled':
          settings.agreementEnabled = item.setting_value;
          break;
      }
    });

    console.log('Processed form settings:', settings);
    return settings;
  } catch (error) {
    console.error('Exception fetching form settings:', error);
    return null;
  }
}

/**
 * Fetch all payment plans for all credit tiers
 * @returns Record of credit tier to payment plans array
 */
export async function fetchAllPaymentPlans(): Promise<Record<CreditTier, PaymentPlan[]> | null> {
  if (!supabase) {
    console.warn('Supabase not configured. Using fallback plans.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('is_active', true)
      .order('credit_tier', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching all payment plans:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn('No active payment plans found');
      return null;
    }

    // Group by credit tier
    const plansByTier: Record<CreditTier, PaymentPlan[]> = {
      '700+': [],
      '600-700': [],
      'below-600': [],
    };

    data.forEach((plan: DatabasePaymentPlan) => {
      const tier = plan.credit_tier;
      if (tier in plansByTier) {
        plansByTier[tier].push({
          months: plan.months,
          perPayment: plan.per_payment,
          totalPayments: plan.total_payments,
        });
      }
    });

    return plansByTier;
  } catch (error) {
    console.error('Exception fetching all payment plans:', error);
    return null;
  }
}

// Application submission interface
export interface ApplicationData {
  sessionId: string;
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
    
    const { data: insertedData, error } = await supabase.from('applications').insert({
      session_id: data.sessionId,
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
    }).select();

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    if (insertedData && insertedData.length > 0) {
      console.log('✅ Application saved successfully:', {
        sessionId: data.sessionId,
        email: data.email,
        applicationId: insertedData[0].id,
      });
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
