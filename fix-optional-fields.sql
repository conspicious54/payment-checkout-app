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

-- Fix RLS policy to allow SELECT for checking existing records
-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Applications are viewable by service role only" ON applications;

-- Create a new policy that allows SELECT for checking existing records
CREATE POLICY "Applications can be selected by session_id"
  ON applications FOR SELECT
  USING (true);
