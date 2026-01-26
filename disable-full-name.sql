-- Disable Full Name Field
-- Run this in Supabase SQL Editor

-- First, add the setting if it doesn't exist
INSERT INTO form_settings (setting_key, setting_value, description) 
VALUES ('full_name_enabled', true, 'Enable/disable full name field in application form')
ON CONFLICT (setting_key) DO NOTHING;

-- Then disable it
UPDATE form_settings 
SET setting_value = false 
WHERE setting_key = 'full_name_enabled';

-- Verify the change
SELECT setting_key, setting_value, description 
FROM form_settings 
WHERE setting_key = 'full_name_enabled';
