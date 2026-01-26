// Test Application Data Saving
// Run with: node test-application-save.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  try {
    const envFile = readFileSync(join(__dirname, '.env'), 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch (error) {
    return {};
  }
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

console.log('Testing application data saving...\n');

// Test data
const testSessionId = `test_session_${Date.now()}`;
const testData = {
  session_id: testSessionId,
  email: `test_${Date.now()}@example.com`,
  phone: '+15551234567',
  full_name: 'Test User',
  ssn_last_4: '1234',
  credit_tier: '700+',
  plan_months: 6,
  plan_per_payment: 1099.45,
  plan_total_payments: 6,
  payment_frequency: 'monthly',
  status: 'pending',
};

console.log('Inserting test application...');
console.log('Session ID:', testSessionId);
console.log('Email:', testData.email);
console.log('');

const { data, error } = await supabase
  .from('applications')
  .insert(testData)
  .select();

if (error) {
  console.error('❌ Error saving application:', error);
  if (error.message.includes('session_id')) {
    console.error('\n💡 Tip: Make sure you\'ve run add-session-id.sql in Supabase!');
  }
  process.exit(1);
}

console.log('✅ Application saved successfully!');
console.log('Application ID:', data[0].id);
console.log('Session ID:', data[0].session_id);
console.log('Email:', data[0].email);
console.log('');

// Verify we can retrieve it
console.log('Verifying retrieval by session ID...');
const { data: retrieved, error: retrieveError } = await supabase
  .from('applications')
  .select('*')
  .eq('session_id', testSessionId)
  .single();

if (retrieveError) {
  console.error('❌ Error retrieving application:', retrieveError);
  process.exit(1);
}

console.log('✅ Application retrieved successfully!');
console.log('Retrieved data:', {
  session_id: retrieved.session_id,
  email: retrieved.email,
  full_name: retrieved.full_name,
  credit_tier: retrieved.credit_tier,
  plan_months: retrieved.plan_months,
});

console.log('\n🎉 All tests passed! Applications are being saved correctly.');
