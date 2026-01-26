# Form Settings Management Guide

This guide explains how to enable/disable form sections using the database.

## Overview

The application now supports dynamically enabling/disabling form sections through the `form_settings` table in Supabase. This allows you to control which fields users see without changing code.

## Available Settings

The following form sections can be enabled/disabled:

1. **email_enabled** - Email address field
2. **phone_enabled** - Phone number field
3. **phone_verification_enabled** - Phone verification step (SMS code)
4. **ssn_enabled** - SSN (last 4 digits) field
5. **bank_account_enabled** - Bank account verification step

## How to Manage Settings

### Option 1: Using Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to **Table Editor** → `form_settings`
3. Find the setting you want to change (e.g., `email_enabled`)
4. Click on the row to edit
5. Change `setting_value` to:
   - `true` to enable the field
   - `false` to disable the field
6. Click "Save"

### Option 2: Using SQL Editor

1. Go to **SQL Editor** in Supabase
2. Run one of these commands:

```sql
-- Disable email field
UPDATE form_settings 
SET setting_value = false 
WHERE setting_key = 'email_enabled';

-- Enable phone verification
UPDATE form_settings 
SET setting_value = true 
WHERE setting_key = 'phone_verification_enabled';

-- Disable SSN field
UPDATE form_settings 
SET setting_value = false 
WHERE setting_key = 'ssn_enabled';

-- Enable bank account step
UPDATE form_settings 
SET setting_value = true 
WHERE setting_key = 'bank_account_enabled';
```

## Setting Up the Table

If you haven't run the form settings SQL yet:

1. Open `supabase-form-settings.sql` from this project
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click "Run"

This will create the table and insert default settings (all enabled).

## How It Works

### Form Flow Logic

- **Email**: If disabled, form starts with phone (if enabled) or name
- **Phone**: If disabled, form skips phone and goes to name
- **Phone Verification**: If disabled, phone number is collected but verification step is skipped
- **SSN**: If disabled, form skips SSN and goes directly to bank account or payment
- **Bank Account**: If disabled, users skip bank account step even if they meet criteria (below-600 credit or 6+ month plan)

### Step Numbering

The step numbers automatically adjust based on enabled fields:
- If email is disabled, phone becomes step 1 (if enabled)
- If phone is disabled, name becomes step 1
- Total steps shown in UI adjusts automatically

## Examples

### Example 1: Disable Email and SSN

```sql
UPDATE form_settings SET setting_value = false WHERE setting_key = 'email_enabled';
UPDATE form_settings SET setting_value = false WHERE setting_key = 'ssn_enabled';
```

Result: Form will only collect phone number and name.

### Example 2: Disable Phone Verification Only

```sql
UPDATE form_settings SET setting_value = false WHERE setting_key = 'phone_verification_enabled';
```

Result: Phone number is collected, but SMS verification step is skipped.

### Example 3: Enable All Fields

```sql
UPDATE form_settings SET setting_value = true;
```

Result: All form sections are enabled (default state).

## Viewing Current Settings

To see all current settings:

```sql
SELECT * FROM form_settings ORDER BY setting_key;
```

Or use the helper view:

```sql
SELECT * FROM form_settings_view;
```

## Important Notes

1. **Name field is always required** - Cannot be disabled
2. **Payment step is always shown** - Cannot be disabled
3. **Changes take effect immediately** - No restart needed, but users need to refresh
4. **Bank account logic** - Even if `bank_account_enabled` is true, bank account step only shows if:
   - Credit tier is below-600 OR plan is 6+ months
   - AND `bank_account_enabled` is true

## Troubleshooting

### Settings Not Working

1. Check that `form_settings` table exists
2. Verify settings have correct `setting_key` values
3. Check browser console for errors
4. Ensure Supabase connection is working

### Form Shows Wrong Steps

1. Clear browser cache
2. Refresh the page
3. Check that settings are saved correctly in database

### Phone Verification Still Showing

- Make sure `phone_verification_enabled` is set to `false`
- Also check that `phone_enabled` is `true` (verification only shows if phone is enabled)

## Security

- Settings are publicly readable (needed for the app)
- Only service role should be able to update settings
- Consider adding admin authentication for production
