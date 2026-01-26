-- ============================================
-- Quick Setup: Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- 1. Create Payment Plans Table
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_tier TEXT NOT NULL CHECK (credit_tier IN ('700+', '600-700', 'below-600')),
  months INTEGER NOT NULL CHECK (months IN (2, 3, 6)),
  base_amount DECIMAL(10, 2) NOT NULL DEFAULT 5997.00,
  interest_rate DECIMAL(5, 4) NOT NULL,
  per_payment DECIMAL(10, 2) NOT NULL,
  total_payments INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  full_name TEXT NOT NULL,
  ssn_last_4 TEXT NOT NULL,
  credit_tier TEXT NOT NULL CHECK (credit_tier IN ('700+', '600-700', 'below-600')),
  plan_months INTEGER NOT NULL,
  plan_per_payment DECIMAL(10, 2) NOT NULL,
  plan_total_payments INTEGER NOT NULL,
  payment_frequency TEXT NOT NULL CHECK (payment_frequency IN ('monthly', 'bi-weekly')),
  plan_id UUID REFERENCES payment_plans(id),
  bank_account_type TEXT CHECK (bank_account_type IN ('checking', 'savings')),
  bank_routing_number TEXT,
  bank_account_number TEXT,
  card_last_4 TEXT,
  card_exp_date TEXT,
  card_zip TEXT,
  signature_name TEXT,
  signature_signed_at TIMESTAMP WITH TIME ZONE,
  signature_consent_agreed BOOLEAN DEFAULT false,
  signature_agreement_version TEXT,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_payment_plans_credit_tier ON payment_plans(credit_tier);
CREATE INDEX IF NOT EXISTS idx_payment_plans_active ON payment_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_credit_tier ON applications(credit_tier);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- 4. Create Update Timestamp Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create Triggers
CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON payment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies
CREATE POLICY "Payment plans are viewable by everyone"
  ON payment_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Applications can be inserted by anyone"
  ON applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Applications are viewable by service role only"
  ON applications FOR SELECT
  USING (false);

-- 8. Insert Initial Payment Plan Data
INSERT INTO payment_plans (credit_tier, months, base_amount, interest_rate, per_payment, total_payments, total_amount, display_order) VALUES
  ('700+', 6, 5997.00, 0.1000, 1099.45, 6, 6596.70, 1),
  ('700+', 3, 5997.00, 0.0500, 2098.95, 3, 6296.85, 2),
  ('700+', 2, 5997.00, 0.0000, 2998.50, 2, 5997.00, 3),
  ('600-700', 6, 5997.00, 0.1000, 1099.45, 6, 6596.70, 1),
  ('600-700', 3, 5997.00, 0.0500, 2098.95, 3, 6296.85, 2),
  ('600-700', 2, 5997.00, 0.0000, 2998.50, 2, 5997.00, 3),
  ('below-600', 6, 5997.00, 0.1200, 1119.44, 6, 6716.64, 1),
  ('below-600', 3, 5997.00, 0.0700, 2138.93, 3, 6416.79, 2),
  ('below-600', 2, 5997.00, 0.0200, 3058.47, 2, 6116.94, 3);

-- 9. Create Helper View
CREATE OR REPLACE VIEW active_payment_plans AS
SELECT 
  id,
  credit_tier,
  months,
  base_amount,
  interest_rate,
  per_payment,
  total_payments,
  total_amount,
  display_order
FROM payment_plans
WHERE is_active = true
ORDER BY credit_tier, display_order;
