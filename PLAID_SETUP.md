# Plaid Integration Setup Guide

This guide explains how to set up Plaid Link integration for bank account verification.

## Overview

The application now uses Plaid Link instead of manual bank account entry. Plaid provides a secure, bank-level connection that doesn't require users to manually enter routing and account numbers.

## Prerequisites

1. **Plaid Account**: Sign up at https://dashboard.plaid.com/signup
2. **API Access**: Request API access (you mentioned you've already requested this)
3. **Backend Endpoint** (recommended): You'll need a backend server to securely create Link tokens

## Environment Variables

Add these to your `.env` file and Netlify environment variables:

```bash
# Option 1: Backend URL (recommended for production)
VITE_PLAID_BACKEND_URL=https://your-backend-url.com

# Option 2: Demo token (for testing only - not recommended for production)
VITE_PLAID_DEMO_LINK_TOKEN=link-sandbox-xxxxx
```

## Backend Setup (Required for Production)

Plaid requires a backend endpoint to securely create Link tokens using your secret key. Here's an example using Node.js/Express:

### 1. Install Plaid SDK

```bash
npm install plaid
```

### 2. Create Backend Endpoint for Link Token

```javascript
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const express = require('express');
const app = express();

app.use(express.json());

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, // Use 'production' for live
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Create Link token endpoint
app.post('/api/plaid/create-link-token', async (req, res) => {
  try {
    const request = {
      user: {
        client_user_id: req.body.userId || 'user-' + Date.now(),
      },
      client_name: 'Divvy',
      products: ['auth'], // 'auth' allows you to get account and routing numbers
      country_codes: ['US'],
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(request);
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating Link token:', error);
    res.status(500).json({ error: 'Failed to create Link token' });
  }
});

// Exchange public token for access token and get account details
app.post('/api/plaid/exchange-token', async (req, res) => {
  try {
    const { public_token } = req.body;

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;

    // Get account details including routing and account numbers
    const accountsResponse = await plaidClient.authGet({
      access_token: accessToken,
    });

    const account = accountsResponse.data.accounts[0];
    const numbers = accountsResponse.data.numbers.ach[0];

    res.json({
      access_token: accessToken, // Store this securely in your database
      account_id: account.account_id,
      routing_number: numbers.routing,
      account_number: numbers.account,
      account_type: account.type,
      account_subtype: account.subtype,
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 3. Backend Environment Variables

```bash
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret_key
# Use 'sandbox' for testing, 'production' for live
PLAID_ENV=sandbox
```

## Sandbox Testing

For sandbox/demo mode:

1. Go to https://dashboard.plaid.com/developers/keys
2. Copy your **Sandbox** credentials (Client ID and Secret)
3. Use test credentials:
   - Username: `user_good`
   - Password: `pass_good`
   - Or use any of Plaid's test credentials: https://plaid.com/docs/sandbox/test-credentials/

## Database Setup

Run the SQL migration to add Plaid fields:

```sql
-- Run this in your Supabase SQL editor
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS plaid_account_id TEXT,
ADD COLUMN IF NOT EXISTS plaid_public_token TEXT;

CREATE INDEX IF NOT EXISTS idx_applications_plaid_account_id ON applications(plaid_account_id);
```

Or use the provided SQL file:

```bash
# In Supabase SQL Editor, run:
add-plaid-fields.sql
```

## How It Works

1. **User clicks "Connect Bank Account"**: Frontend requests a Link token from your backend
2. **Plaid Link opens**: User selects their bank and enters credentials (handled by Plaid)
3. **Success callback**: Frontend receives `public_token` and account metadata
4. **Token exchange** (optional): Frontend sends `public_token` to backend to get full account/routing numbers
5. **Data saved**: Account information is saved to your database

## Security Notes

- **Never expose your Plaid secret key** in frontend code
- Always use a backend endpoint to create Link tokens
- Store `access_token` securely in your database (encrypted)
- The `public_token` is temporary and should be exchanged immediately
- Plaid credentials are never stored on your servers

## Troubleshooting

### "Unable to initialize bank connection"
- Check that `VITE_PLAID_BACKEND_URL` is set correctly
- Verify your backend endpoint is accessible
- Check browser console for CORS errors

### "Link token not found"
- Ensure your backend is creating tokens correctly
- Verify Plaid credentials are correct
- Check that you're using the right environment (sandbox vs production)

### Account numbers not showing
- The frontend only gets account mask from Plaid Link
- Full account/routing numbers require backend token exchange
- Ensure your backend `/api/plaid/exchange-token` endpoint is working

## Next Steps

1. Set up your backend server with the endpoints above
2. Add environment variables to your `.env` and Netlify
3. Run the database migration (`add-plaid-fields.sql`)
4. Test with Plaid sandbox credentials
5. Once approved, switch to production credentials

## Resources

- [Plaid Link Documentation](https://plaid.com/docs/link/)
- [Plaid API Reference](https://plaid.com/docs/api/)
- [Plaid Sandbox Guide](https://plaid.com/docs/sandbox/)
- [React Plaid Link](https://github.com/plaid/react-plaid-link)
