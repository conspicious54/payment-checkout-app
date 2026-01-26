-- Add Enhanced E-Signature Fields for Legal Compliance
-- Run this in Supabase SQL Editor

-- Add new fields for enhanced e-signature tracking
ALTER TABLE applications 
  ADD COLUMN IF NOT EXISTS signature_agreement_hash TEXT,
  ADD COLUMN IF NOT EXISTS signature_time_spent INTEGER,
  ADD COLUMN IF NOT EXISTS signature_scroll_depth INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN applications.signature_agreement_hash IS 'SHA-256 hash of the agreement text at time of signing - proves what was signed';
COMMENT ON COLUMN applications.signature_time_spent IS 'Time in seconds spent reviewing the agreement before signing';
COMMENT ON COLUMN applications.signature_scroll_depth IS 'Maximum scroll depth percentage reached (0-100) - proves agreement was read';

-- Create index for agreement hash lookups (useful for legal verification)
CREATE INDEX IF NOT EXISTS idx_applications_agreement_hash ON applications(signature_agreement_hash);

-- Note: These fields help establish legal validity of e-signatures by proving:
-- 1. What was signed (agreement hash)
-- 2. That the user had opportunity to read it (time spent, scroll depth)
-- 3. Identity verification (IP address, user agent, signature name match)
