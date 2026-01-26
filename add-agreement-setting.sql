-- Add Agreement/E-Signature Setting
-- Run this in Supabase SQL Editor

-- Add agreement_enabled setting
INSERT INTO form_settings (setting_key, setting_value, description) 
VALUES ('agreement_enabled', true, 'Enable/disable agreement/e-signature step')
ON CONFLICT (setting_key) DO NOTHING;

-- To disable agreement:
-- UPDATE form_settings SET setting_value = false WHERE setting_key = 'agreement_enabled';

-- To enable agreement:
-- UPDATE form_settings SET setting_value = true WHERE setting_key = 'agreement_enabled';
