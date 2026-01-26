-- Add session_id column to applications table
-- Run this in Supabase SQL Editor

-- Add session_id column
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create index for faster lookups by session ID
CREATE INDEX IF NOT EXISTS idx_applications_session_id ON applications(session_id);

-- Create index for email lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);

-- Optional: Create a view to easily see applications with session info
CREATE OR REPLACE VIEW applications_with_session AS
SELECT 
  id,
  session_id,
  email,
  full_name,
  phone,
  credit_tier,
  plan_months,
  plan_per_payment,
  plan_total_payments,
  payment_frequency,
  status,
  created_at,
  updated_at
FROM applications
ORDER BY created_at DESC;
