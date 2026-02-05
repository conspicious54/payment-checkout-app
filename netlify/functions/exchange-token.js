const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Get Plaid credentials from environment variables
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const environment = process.env.PLAID_ENV || 'sandbox';

    if (!clientId || !secret) {
      console.error('Missing Plaid credentials');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Plaid credentials not configured' }),
      };
    }

    // Initialize Plaid client
    const configuration = new Configuration({
      basePath: environment === 'production' 
        ? PlaidEnvironments.production 
        : PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': clientId,
          'PLAID-SECRET': secret,
        },
      },
    });

    const plaidClient = new PlaidApi(configuration);

    // Parse request body
    let publicToken;
    try {
      const body = JSON.parse(event.body || '{}');
      publicToken = body.public_token;
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

    if (!publicToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'public_token is required' }),
      };
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;

    // Get account details including routing and account numbers
    const accountsResponse = await plaidClient.authGet({
      access_token: accessToken,
    });

    if (!accountsResponse.data.accounts || accountsResponse.data.accounts.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No accounts found' }),
      };
    }

    const account = accountsResponse.data.accounts[0];
    const numbers = accountsResponse.data.numbers?.ach?.[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        access_token: accessToken, // Store this securely in your database
        account_id: account.account_id,
        routing_number: numbers?.routing || null,
        account_number: numbers?.account || null,
        account_type: account.type,
        account_subtype: account.subtype,
        account_mask: account.mask,
        account_name: account.name,
      }),
    };
  } catch (error) {
    console.error('Error exchanging token:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to exchange token',
        message: error.message || 'Unknown error',
      }),
    };
  }
};
