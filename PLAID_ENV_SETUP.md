# Plaid Environment Variables Setup for Netlify

## Required Environment Variables

Add these to your Netlify dashboard:

1. Go to **Site configuration** → **Environment variables**
2. Add the following variables:

### For Sandbox (Testing):
- **Key**: `PLAID_CLIENT_ID`
  - **Value**: `696fdf79fe7d77001e1434e2`
  - **Scopes**: All scopes

- **Key**: `PLAID_SECRET`
  - **Value**: `7ecdf8e5175a31a08466fb230f4b41` (Sandbox secret)
  - **Scopes**: All scopes

- **Key**: `PLAID_ENV`
  - **Value**: `sandbox`
  - **Scopes**: All scopes

### For Production (When Ready):
- **Key**: `PLAID_CLIENT_ID`
  - **Value**: `696fdf79fe7d77001e1434e2` (same)
  - **Scopes**: Production only

- **Key**: `PLAID_SECRET`
  - **Value**: `ba5caf151df7c3ffcb3fcbe33a0cd8` (Production secret)
  - **Scopes**: Production only

- **Key**: `PLAID_ENV`
  - **Value**: `production`
  - **Scopes**: Production only

## Important Notes

- These environment variables are **server-side only** (not exposed to the browser)
- The Netlify functions will use these to securely create Plaid Link tokens
- Never commit these secrets to git
- The `.env` file is already in `.gitignore`

## After Adding Variables

1. **Redeploy your site** in Netlify:
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**

2. **Test the Plaid integration**:
   - Open your site
   - Go through the application flow
   - When you reach the bank account step, click "Connect Bank Account with Plaid"
   - The Plaid Link modal should open

## Troubleshooting

### "Unable to initialize bank connection"
- Check that all three environment variables are set in Netlify
- Verify the values are correct (no extra spaces)
- Make sure you've redeployed after adding variables

### "Plaid credentials not configured"
- The Netlify function can't find the environment variables
- Check that variable names are exactly: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`
- Redeploy the site

### Plaid Link modal doesn't open
- Check browser console for errors
- Verify the Netlify function is deployed (check Functions tab in Netlify)
- Test the function directly: `https://your-site.netlify.app/.netlify/functions/create-link-token`

## Testing with Sandbox

When using sandbox mode, you can test with these credentials:
- **Username**: `user_good`
- **Password**: `pass_good`
- Or use any test credentials from: https://plaid.com/docs/sandbox/test-credentials/
