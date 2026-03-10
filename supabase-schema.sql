-- ============================================
-- Supabase Database Schema
-- Payment Checkout Application
-- ============================================

-- ============================================
-- 1. PAYMENT PLANS TABLE
-- Stores dynamic pricing for payment plans
-- ============================================

CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_tier TEXT NOT NULL CHECK (credit_tier IN ('700+', '600-700', 'below-600')),
  months INTEGER NOT NULL CHECK (months IN (2, 3, 6, 12, 18)),
  base_amount DECIMAL(10, 2) NOT NULL DEFAULT 5997.00,
  interest_rate DECIMAL(5, 4) NOT NULL, -- e.g., 0.0350 for 3.5%
  per_payment DECIMAL(10, 2) NOT NULL,
  total_payments INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0, -- For ordering plans (e.g., 1, 2, 3)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_payment_plans_credit_tier ON payment_plans(credit_tier);
CREATE INDEX IF NOT EXISTS idx_payment_plans_active ON payment_plans(is_active);

-- ============================================
-- 2. APPLICATIONS TABLE
-- Stores submitted application data
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity Information
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  full_name TEXT NOT NULL,
  ssn_last_4 TEXT NOT NULL,
  
  -- Credit & Plan Information
  credit_tier TEXT NOT NULL CHECK (credit_tier IN ('700+', '600-700', 'below-600')),
  plan_months INTEGER NOT NULL,
  plan_per_payment DECIMAL(10, 2) NOT NULL,
  plan_total_payments INTEGER NOT NULL,
  payment_frequency TEXT NOT NULL CHECK (payment_frequency IN ('monthly', 'bi-weekly')),
  plan_id UUID REFERENCES payment_plans(id), -- Link to the plan used
  
  -- Bank Account Information (optional)
  bank_account_type TEXT CHECK (bank_account_type IN ('checking', 'savings')),
  bank_routing_number TEXT,
  bank_account_number TEXT, -- Should be encrypted in production
  
  -- Payment Card Information (optional)
  card_last_4 TEXT,
  card_exp_date TEXT,
  card_zip TEXT,
  
  -- E-Signature Information
  signature_name TEXT,
  signature_signed_at TIMESTAMP WITH TIME ZONE,
  signature_consent_agreed BOOLEAN DEFAULT false,
  signature_agreement_version TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for applications
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_credit_tier ON applications(credit_tier);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- ============================================
-- 3. TRIGGER: Update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON payment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Payment Plans: Public read access for active plans only
CREATE POLICY "Payment plans are viewable by everyone"
  ON payment_plans FOR SELECT
  USING (is_active = true);

-- Applications: Only authenticated users can insert (adjust based on your auth needs)
-- For now, allow inserts but restrict reads
CREATE POLICY "Applications can be inserted by anyone"
  ON applications FOR INSERT
  WITH CHECK (true);

-- Applications: Only service role can read (you'll need to adjust this)
-- In production, you'd want proper authentication
CREATE POLICY "Applications are viewable by service role only"
  ON applications FOR SELECT
  USING (false); -- Change this based on your auth setup

-- ============================================
-- 5. INITIAL DATA: Payment Plans
-- Insert the current pricing structure
-- ============================================

-- 700+ and 600-700 Credit Tiers (same rates)
INSERT INTO payment_plans (credit_tier, months, base_amount, interest_rate, per_payment, total_payments, total_amount, display_order) VALUES
  ('700+', 18, 5997.00, 0.3000, 433.12, 18, 7796.16, 1),
  ('700+', 12, 5997.00, 0.2000, 599.70, 12, 7196.40, 2),
  ('700+', 6, 5997.00, 0.1000, 1099.45, 6, 6596.70, 3),
  ('700+', 3, 5997.00, 0.0500, 2098.95, 3, 6296.85, 4),
  ('700+', 2, 5997.00, 0.0000, 2998.50, 2, 5997.00, 5),
  ('600-700', 18, 5997.00, 0.3000, 433.12, 18, 7796.16, 1),
  ('600-700', 12, 5997.00, 0.2000, 599.70, 12, 7196.40, 2),
  ('600-700', 6, 5997.00, 0.1000, 1099.45, 6, 6596.70, 3),
  ('600-700', 3, 5997.00, 0.0500, 2098.95, 3, 6296.85, 4),
  ('600-700', 2, 5997.00, 0.0000, 2998.50, 2, 5997.00, 5);

-- Below-600 Credit Tier (2% extra)
INSERT INTO payment_plans (credit_tier, months, base_amount, interest_rate, per_payment, total_payments, total_amount, display_order) VALUES
  ('below-600', 18, 5997.00, 0.3200, 439.78, 18, 7916.04, 1),
  ('below-600', 12, 5997.00, 0.2200, 609.70, 12, 7316.40, 2),
  ('below-600', 6, 5997.00, 0.1200, 1119.44, 6, 6716.64, 3),
  ('below-600', 3, 5997.00, 0.0700, 2138.93, 3, 6416.79, 4),
  ('below-600', 2, 5997.00, 0.0200, 3058.47, 2, 6116.94, 5);

-- ============================================
-- 6. HELPER VIEW: Active Plans by Tier
-- ============================================

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
