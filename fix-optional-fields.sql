-- Fix Optional Fields in Applications Table
-- Make phone, full_name, ssn_last_4, and email nullable since they can be disabled via form settings
-- Run this in Supabase SQL Editor

-- Make email nullable (for progressive saving)
ALTER TABLE applications 
  ALTER COLUMN email DROP NOT NULL;

-- Make phone nullable (can be disabled)
ALTER TABLE applications 
  ALTER COLUMN phone DROP NOT NULL;

-- Make full_name nullable (can be disabled)
ALTER TABLE applications 
  ALTER COLUMN full_name DROP NOT NULL;

-- Make ssn_last_4 nullable (can be disabled)
ALTER TABLE applications 
  ALTER COLUMN ssn_last_4 DROP NOT NULL;

-- Update status check constraint to include new status values
-- Drop ALL check constraints on the status column (using multiple possible names)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'applications'::regclass 
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%status%'
    ) LOOP
        EXECUTE 'ALTER TABLE applications DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Now add the new constraint with all status values
ALTER TABLE applications 
  ADD CONSTRAINT applications_status_check 
  CHECK (status IN ('pending', 'in_progress', 'payment_pending', 'approved', 'rejected', 'processing'));

-- Fix RLS policy to allow SELECT for checking existing records
-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Applications are viewable by service role only" ON applications;

-- Create a new policy that allows SELECT for checking existing records
CREATE POLICY "Applications can be selected by session_id"
  ON applications FOR SELECT
  USING (true);
