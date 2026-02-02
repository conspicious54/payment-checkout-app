-- Add Plaid integration fields to applications table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS plaid_account_id TEXT,
ADD COLUMN IF NOT EXISTS plaid_public_token TEXT;

-- Add index for Plaid account ID lookups
CREATE INDEX IF NOT EXISTS idx_applications_plaid_account_id ON applications(plaid_account_id);

-- Add comment explaining the fields
COMMENT ON COLUMN applications.plaid_account_id IS 'Plaid account ID for the connected bank account';
COMMENT ON COLUMN applications.plaid_public_token IS 'Plaid public token (temporary, should be exchanged for access_token on backend)';
