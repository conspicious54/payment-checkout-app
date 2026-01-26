-- SQL Queries to View Applications
-- Run these in Supabase SQL Editor

-- View all applications with session IDs
SELECT 
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
  created_at
FROM applications
ORDER BY created_at DESC;

-- View applications by email
SELECT 
  session_id,
  email,
  full_name,
  credit_tier,
  plan_months,
  status,
  created_at
FROM applications
WHERE email = 'user@example.com'  -- Replace with actual email
ORDER BY created_at DESC;

-- View applications by session ID
SELECT 
  session_id,
  email,
  full_name,
  phone,
  credit_tier,
  plan_months,
  plan_per_payment,
  plan_total_payments,
  payment_frequency,
  bank_account_type,
  card_last_4,
  signature_name,
  status,
  created_at
FROM applications
WHERE session_id = 'session_1234567890_abc123'  -- Replace with actual session ID
ORDER BY created_at DESC;

-- Count applications by status
SELECT 
  status,
  COUNT(*) as count
FROM applications
GROUP BY status;

-- View recent applications (last 24 hours)
SELECT 
  session_id,
  email,
  full_name,
  credit_tier,
  plan_months,
  status,
  created_at
FROM applications
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- View applications with all details (be careful with sensitive data)
SELECT * FROM applications
ORDER BY created_at DESC
LIMIT 100;
