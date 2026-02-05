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
    let userId;
    try {
      const body = JSON.parse(event.body || '{}');
      userId = body.userId || `user-${Date.now()}`;
    } catch (e) {
      userId = `user-${Date.now()}`;
    }

    // Create Link token
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Divvy',
      products: ['auth'], // 'auth' allows you to get account and routing numbers
      country_codes: ['US'],
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(request);
    const linkToken = response.data.link_token;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ link_token: linkToken }),
    };
  } catch (error) {
    console.error('Error creating Link token:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create Link token',
        message: error.message || 'Unknown error',
      }),
    };
  }
};
