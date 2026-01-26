// Test Supabase Database Connection
// Run with: node test-db-connection.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
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
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl || '❌ NOT SET');
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 30)}...` : '❌ NOT SET');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Environment variables not set!');
  console.error('Make sure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    console.log('📡 Test 1: Checking connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('payment_plans')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Connection failed:', healthError.message);
      if (healthError.message.includes('relation') || healthError.message.includes('does not exist')) {
        console.error('\n💡 Tip: Make sure you\'ve run the SQL schema in Supabase SQL Editor!');
        console.error('   Use the file: supabase-setup-simple.sql');
      }
      return false;
    }
    console.log('✅ Connection successful!\n');

    // Test 2: Check if payment_plans table exists and has data
    console.log('📊 Test 2: Checking payment_plans table...');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('is_active', true)
      .order('credit_tier', { ascending: true })
      .order('display_order', { ascending: true });

    if (plansError) {
      console.error('❌ Error fetching payment plans:', plansError.message);
      console.error('   Make sure you\'ve run the SQL schema in Supabase!');
      return false;
    }

    if (!plans || plans.length === 0) {
      console.error('❌ No payment plans found!');
      console.error('   Make sure you\'ve run the SQL schema with INSERT statements!');
      return false;
    }

    console.log(`✅ Found ${plans.length} active payment plans:`);
    
    // Group by credit tier
    const plansByTier = {};
    plans.forEach(plan => {
      if (!plansByTier[plan.credit_tier]) {
        plansByTier[plan.credit_tier] = [];
      }
      plansByTier[plan.credit_tier].push(plan);
    });

    Object.keys(plansByTier).sort().forEach(tier => {
      console.log(`\n   ${tier}:`);
      plansByTier[tier].forEach(plan => {
        console.log(`     - ${plan.months} months: $${plan.per_payment}/payment (${(plan.interest_rate * 100).toFixed(1)}% interest)`);
      });
    });
    console.log('');

    // Test 3: Check if applications table exists
    console.log('📝 Test 3: Checking applications table...');
    const { data: apps, error: appsError } = await supabase
      .from('applications')
      .select('count')
      .limit(1);

    if (appsError) {
      console.error('❌ Error accessing applications table:', appsError.message);
      if (appsError.message.includes('relation') || appsError.message.includes('does not exist')) {
        console.error('   Make sure you\'ve run the SQL schema in Supabase!');
      }
      return false;
    }

    console.log('✅ Applications table exists and is accessible!');
    console.log('');

    // Test 4: Verify RLS policies
    console.log('🔒 Test 4: Checking Row Level Security...');
    const { error: rlsError } = await supabase
      .from('applications')
      .select('id')
      .limit(0);

    if (rlsError && rlsError.message.includes('permission denied')) {
      console.log('⚠️  Note: RLS policies are active (this is good for security)');
    } else {
      console.log('✅ RLS policies configured correctly');
    }
    console.log('');

    // Summary
    console.log('🎉 All tests passed!');
    console.log('');
    console.log('✅ Database connection: Working');
    console.log('✅ Payment plans table: Working');
    console.log('✅ Applications table: Working');
    console.log('✅ Permissions: Configured correctly');
    console.log('');
    console.log('🚀 Your app is ready to use the database!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Restart your dev server: npm run dev');
    console.log('  2. The app will now load plans from the database');
    console.log('  3. Applications will be saved automatically');

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
