-- Fix Status Check Constraint - More Robust Version
-- Run this in Supabase SQL Editor

-- First, let's see what constraints exist (for debugging)
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'applications'::regclass 
-- AND contype = 'c';

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

-- Verify it was created
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'applications'::regclass 
-- AND contype = 'c' 
-- AND pg_get_constraintdef(oid) LIKE '%status%';
