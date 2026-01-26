# Netlify Environment Variables Setup

Your app needs Supabase environment variables to work properly. Here's how to set them up in Netlify.

## Step 1: Get Your Supabase Credentials

You already have these:
- **URL**: `https://xhhudvvfqbugydyruczb.supabase.co`
- **Anon Key**: `sb_publishable_NgGb7EW8AlyRKT5NfHfR0w_yXJDhEAN`

## Step 2: Add Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site configuration** → **Environment variables** (or **Build & deploy** → **Environment**)
4. Click **Add variable** and add these two:

### Variable 1:
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://xhhudvvfqbugydyruczb.supabase.co`
- **Scopes**: All scopes (or just Production if you want)

### Variable 2:
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `sb_publishable_NgGb7EW8AlyRKT5NfHfR0w_yXJDhEAN`
- **Scopes**: All scopes (or just Production if you want)

## Step 3: Redeploy

After adding the environment variables:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Or push a new commit to trigger auto-deploy

## Step 4: Verify

After redeploy, check the browser console. You should see:
- ✅ "Form settings loaded from database: ..."
- ✅ Payment plans loading from database

Instead of:
- ❌ "Supabase not configured"
- ❌ "Form settings not loaded"

## Important Notes

- Environment variables starting with `VITE_` are exposed to the browser (this is safe for Supabase anon key)
- The `.env` file is not committed to git (correct for security)
- You must set these in Netlify's dashboard for the deployed site to work

## Troubleshooting

If it still doesn't work after setting variables:
1. Make sure variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Make sure there are no extra spaces in the values
3. Clear browser cache and hard refresh
4. Check Netlify build logs to see if variables are being read
