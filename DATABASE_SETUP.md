# Database Setup Guide

This guide will help you set up Supabase to store payment plans dynamically and collect application data.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: `payment-checkout-app` (or your preferred name)
   - Database Password: Choose a strong password (save this!)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Run Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Open the file `supabase-schema.sql` from this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run" to execute the schema

This will create:
- `payment_plans` table - Stores dynamic pricing
- `applications` table - Stores submitted applications
- Indexes for performance
- Row Level Security (RLS) policies
- Initial payment plan data

## Step 3: Configure Environment Variables

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

3. Create a `.env` file in your project root:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Important**: Add `.env` to your `.gitignore` (it should already be there)

## Step 4: Verify Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see two tables:
   - `payment_plans` - Should have 9 rows (3 plans × 3 credit tiers)
   - `applications` - Should be empty (will populate as users submit)

3. Check `payment_plans` table:
   - Should have plans for 700+, 600-700, and below-600
   - Each tier should have 2, 3, and 6 month options

## Step 5: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. The app should load payment plans from the database
3. Try submitting a test application to verify data is being saved

## Managing Payment Plans

### View Plans
- Go to Supabase dashboard → **Table Editor** → `payment_plans`
- You can see and edit all plans here

### Update Pricing
1. Go to `payment_plans` table
2. Click on a plan row to edit
3. Update:
   - `per_payment` - Payment amount
   - `total_amount` - Total cost
   - `interest_rate` - Interest percentage (as decimal, e.g., 0.10 for 10%)
4. Click "Save"

### Add New Plans
1. In `payment_plans` table, click "Insert row"
2. Fill in:
   - `credit_tier`: '700+', '600-700', or 'below-600'
   - `months`: 2, 3, or 6
   - `base_amount`: 5997.00
   - `interest_rate`: As decimal (e.g., 0.035 for 3.5%)
   - `per_payment`: Calculated amount
   - `total_payments`: Same as months
   - `total_amount`: `per_payment * total_payments`
   - `is_active`: true
   - `display_order`: 1, 2, or 3 (for ordering)

### Deactivate Plans
- Set `is_active` to `false` to hide a plan without deleting it

## Viewing Applications

1. Go to Supabase dashboard → **Table Editor** → `applications`
2. You'll see all submitted applications with:
   - Customer information
   - Selected plan details
   - Payment information (last 4 digits only)
   - E-signature data
   - Timestamps

## Security Recommendations

### Row Level Security (RLS)
The schema includes basic RLS policies. For production:

1. **Payment Plans**: Already set to public read (anyone can view active plans)
2. **Applications**: Currently set to insert-only for public
   - Update RLS to restrict reads to authenticated admin users
   - Consider using Supabase Auth for admin access

### Data Encryption
For production, you should:
- Encrypt sensitive fields (SSN, bank account numbers) before storing
- Use Supabase Vault or encryption at application level
- Never store CVV codes (already handled in code)

### API Keys
- The `anon` key is safe for client-side use (RLS protects data)
- Never expose your `service_role` key in client code
- Use environment variables for all keys

## Troubleshooting

### Plans Not Loading
- Check browser console for errors
- Verify environment variables are set correctly
- Check Supabase dashboard → Logs for API errors
- Ensure `payment_plans` table has `is_active = true` rows

### Applications Not Saving
- Check RLS policies allow inserts
- Verify table structure matches schema
- Check Supabase logs for detailed error messages

### Connection Issues
- Verify `VITE_SUPABASE_URL` is correct (no trailing slash)
- Check `VITE_SUPABASE_ANON_KEY` is the anon/public key (not service_role)
- Ensure your Supabase project is active (not paused)

## Next Steps

1. **Set up authentication** for admin access to view applications
2. **Configure webhooks** to notify you of new applications
3. **Set up backups** in Supabase dashboard
4. **Monitor usage** in Supabase dashboard → Settings → Usage

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Issues: Check GitHub issues
