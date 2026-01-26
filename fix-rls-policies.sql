-- Fix Row Level Security Policies for Applications Table
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Applications can be inserted by anyone" ON applications;
DROP POLICY IF EXISTS "Applications are viewable by service role only" ON applications;

-- Allow anyone to insert applications (needed for form submissions)
CREATE POLICY "Applications can be inserted by anyone"
  ON applications FOR INSERT
  WITH CHECK (true);

-- Allow service role to view all applications
-- For now, we'll allow public to view (you may want to restrict this later)
CREATE POLICY "Applications are viewable by service role"
  ON applications FOR SELECT
  USING (true);

-- Optional: If you want to restrict SELECT to only service role, use this instead:
-- CREATE POLICY "Applications are viewable by service role only"
--   ON applications FOR SELECT
--   USING (auth.role() = 'service_role');

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'applications';
