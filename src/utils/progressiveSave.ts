import { supabase } from './supabase';

/**
 * Save partial application data as user progresses through form
 * This allows data to be saved even if user doesn't complete payment
 */
export interface PartialApplicationData {
  sessionId: string;
  email?: string;
  phone?: string;
  fullName?: string;
  ssn?: string;
  creditTier?: string;
  planMonths?: number;
  planPerPayment?: number;
  planTotalPayments?: number;
  paymentFrequency?: string;
  bankAccount?: {
    accountType: string;
    routingNumber: string;
    accountNumber: string;
  };
  paymentCard?: {
    cardNumber: string;
    expDate: string;
    cvv: string;
    zipCode: string;
  };
  signature?: {
    signatureName: string;
    signedAt: string;
    consentAgreed: boolean;
    agreementVersion: string;
  };
  status?: string;
}

/**
 * Save or update partial application data
 * Uses upsert to update existing record or create new one
 */
export async function savePartialApplication(data: PartialApplicationData): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!supabase) {
    console.warn('Supabase not configured. Cannot save partial application.');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Check if application with this session_id already exists
    const { data: existing, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('session_id', data.sessionId)
      .single();

    const applicationData: Record<string, any> = {
      session_id: data.sessionId,
      status: data.status || 'in_progress',
    };

    // Only include fields that have values
    if (data.email) applicationData.email = data.email;
    if (data.phone) applicationData.phone = data.phone;
    if (data.fullName) applicationData.full_name = data.fullName;
    if (data.ssn) applicationData.ssn_last_4 = data.ssn;
    if (data.creditTier) applicationData.credit_tier = data.creditTier;
    if (data.planMonths !== undefined) applicationData.plan_months = data.planMonths;
    if (data.planPerPayment !== undefined) applicationData.plan_per_payment = data.planPerPayment;
    if (data.planTotalPayments !== undefined) applicationData.plan_total_payments = data.planTotalPayments;
    if (data.paymentFrequency) applicationData.payment_frequency = data.paymentFrequency;
    
    if (data.bankAccount) {
      applicationData.bank_account_type = data.bankAccount.accountType;
      applicationData.bank_routing_number = data.bankAccount.routingNumber;
      applicationData.bank_account_number = data.bankAccount.accountNumber;
    }
    
    if (data.paymentCard) {
      applicationData.card_last_4 = data.paymentCard.cardNumber.slice(-4);
      applicationData.card_exp_date = data.paymentCard.expDate;
      applicationData.card_zip = data.paymentCard.zipCode;
    }
    
    if (data.signature) {
      applicationData.signature_name = data.signature.signatureName;
      applicationData.signature_signed_at = data.signature.signedAt;
      applicationData.signature_consent_agreed = data.signature.consentAgreed;
      applicationData.signature_agreement_version = data.signature.agreementVersion;
    }

    applicationData.user_agent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    applicationData.updated_at = new Date().toISOString();

    let result;
    if (existing && !checkError) {
      // Update existing record
      result = await supabase
        .from('applications')
        .update(applicationData)
        .eq('session_id', data.sessionId)
        .select();
    } else {
      // Create new record
      applicationData.created_at = new Date().toISOString();
      result = await supabase
        .from('applications')
        .insert(applicationData)
        .select();
    }

    if (result.error) {
      console.error('Error saving partial application:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception saving partial application:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
