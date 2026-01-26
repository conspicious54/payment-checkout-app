-- Disable Phone Number and Phone Verification
-- Run this in Supabase SQL Editor

-- Disable phone number field
UPDATE form_settings 
SET setting_value = false 
WHERE setting_key = 'phone_enabled';

-- Disable phone verification step
UPDATE form_settings 
SET setting_value = false 
WHERE setting_key = 'phone_verification_enabled';

-- Verify the changes
SELECT setting_key, setting_value, description 
FROM form_settings 
WHERE setting_key IN ('phone_enabled', 'phone_verification_enabled');
