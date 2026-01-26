import { z } from 'zod';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Zod schemas for validation
const emailSchema = z.string().email('Please enter a valid email address').min(4, 'Email is too short');
// Phone can have country code (+1, +44, etc.) or just digits - minimum 10 digits after country code
const phoneSchema = z.string().min(10, 'Please enter a valid phone number').regex(/^\d{10,15}$/, 'Phone number must contain 10-15 digits');
const nameSchema = z.string().min(3, 'Please enter your full name').trim();
const ssnSchema = z.string().length(4, 'Please enter the last 4 digits of your SSN').regex(/^\d{4}$/, 'SSN must contain only digits');
const routingNumberSchema = z.string().length(9, 'Routing number must be 9 digits').regex(/^\d{9}$/, 'Routing number must contain only digits');
const accountNumberSchema = z.string().min(4, 'Account number must be at least 4 digits');
const cardNumberSchema = z.string().length(16, 'Card number must be 16 digits').regex(/^\d{16}$/, 'Card number must contain only digits');
const expDateSchema = z.string().regex(/^\d{2}\/\d{2}$/, 'Please enter a valid expiration date (MM/YY)');
const cvvSchema = z.string().min(3, 'CVV must be at least 3 digits').max(4, 'CVV must be at most 4 digits').regex(/^\d+$/, 'CVV must contain only digits');
const zipCodeSchema = z.string().length(5, 'ZIP code must be 5 digits').regex(/^\d{5}$/, 'ZIP code must contain only digits');

// Email validation
export function validateEmail(email: string): ValidationResult {
  try {
    emailSchema.parse(email);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: { email: error.errors[0]?.message || 'Please enter a valid email address' },
      };
    }
    return { isValid: false, errors: { email: 'Please enter a valid email address' } };
  }
}

// Phone validation (with country code support)
export function validatePhone(phone: string): ValidationResult {
  // Remove all non-digits except the leading +
  const hasCountryCode = phone.startsWith('+');
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it has country code and at least 10 digits (for US: +1 + 10 digits)
  // Or at least 10 digits without country code
  let isValidLength = false;
  if (hasCountryCode) {
    // With country code: need at least 11 digits (+1 + 10 digits for US)
    isValidLength = cleaned.length >= 11;
  } else {
    // Without country code: need at least 10 digits
    isValidLength = cleaned.length >= 10;
  }
  
  try {
    // Validate cleaned phone (without +)
    phoneSchema.parse(cleaned);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: { phone: error.errors[0]?.message || 'Please enter a valid phone number' },
      };
    }
    return { isValid: false, errors: { phone: 'Please enter a valid phone number' } };
  }
}

// Name validation
export function validateName(name: string): ValidationResult {
  try {
    nameSchema.parse(name);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: { name: error.errors[0]?.message || 'Please enter your full name' },
      };
    }
    return { isValid: false, errors: { name: 'Please enter your full name' } };
  }
}

// SSN validation (last 4 digits)
export function validateSSN(ssn: string): ValidationResult {
  const cleaned = ssn.replace(/\D/g, '');
  try {
    ssnSchema.parse(cleaned);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: { ssn: error.errors[0]?.message || 'Please enter the last 4 digits of your SSN' },
      };
    }
    return { isValid: false, errors: { ssn: 'Please enter the last 4 digits of your SSN' } };
  }
}

// Bank account validation
export function validateBankAccount(accountNumber: string, routingNumber: string): ValidationResult {
  const errors: Record<string, string> = {};
  
  try {
    accountNumberSchema.parse(accountNumber);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.accountNumber = error.errors[0]?.message || 'Account number must be at least 4 digits';
    }
  }
  
  try {
    routingNumberSchema.parse(routingNumber);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.routingNumber = error.errors[0]?.message || 'Routing number must be 9 digits';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Payment card validation
export function validatePaymentCard(
  cardNumber: string,
  expDate: string,
  cvv: string,
  zipCode: string
): ValidationResult {
  const errors: Record<string, string> = {};
  
  try {
    cardNumberSchema.parse(cardNumber);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.cardNumber = error.errors[0]?.message || 'Card number must be 16 digits';
    }
  }
  
  try {
    expDateSchema.parse(expDate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.expDate = error.errors[0]?.message || 'Please enter a valid expiration date (MM/YY)';
    }
  }
  
  try {
    cvvSchema.parse(cvv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.cvv = error.errors[0]?.message || 'CVV must be 3 or 4 digits';
    }
  }
  
  try {
    zipCodeSchema.parse(zipCode);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.zipCode = error.errors[0]?.message || 'ZIP code must be 5 digits';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
