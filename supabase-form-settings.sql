-- ============================================
-- Form Settings Table
-- Allows enabling/disabling form sections
-- ============================================

CREATE TABLE IF NOT EXISTS form_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_form_settings_key ON form_settings(setting_key);

-- Trigger for updated_at
CREATE TRIGGER update_form_settings_updated_at
  BEFORE UPDATE ON form_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE form_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read form settings (needed for the app)
CREATE POLICY "Form settings are viewable by everyone"
  ON form_settings FOR SELECT
  USING (true);

-- Policy: Only service role can update (you'll need to adjust this based on your auth)
-- For now, we'll allow updates but you should restrict this in production
CREATE POLICY "Form settings can be updated by service role"
  ON form_settings FOR UPDATE
  USING (true);

-- Insert default settings (all enabled by default)
INSERT INTO form_settings (setting_key, setting_value, description) VALUES
  ('email_enabled', true, 'Enable/disable email field in application form'),
  ('phone_enabled', true, 'Enable/disable phone number field in application form'),
  ('phone_verification_enabled', true, 'Enable/disable phone verification step'),
  ('ssn_enabled', true, 'Enable/disable SSN (last 4 digits) field in application form'),
  ('bank_account_enabled', true, 'Enable/disable bank account verification step')
ON CONFLICT (setting_key) DO NOTHING;

-- Helper view for easy access
CREATE OR REPLACE VIEW form_settings_view AS
SELECT 
  setting_key,
  setting_value as enabled,
  description
FROM form_settings
ORDER BY setting_key;
