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

console.log('Testing form settings fetch...\n');

const { data, error } = await supabase
  .from('form_settings')
  .select('setting_key, setting_value');

if (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

console.log('✅ Settings fetched:');
const settings = {
  emailEnabled: true,
  phoneEnabled: true,
  phoneVerificationEnabled: true,
  ssnEnabled: true,
  bankAccountEnabled: true,
};

data.forEach(item => {
  switch (item.setting_key) {
    case 'phone_enabled':
      settings.phoneEnabled = item.setting_value;
      break;
    case 'phone_verification_enabled':
      settings.phoneVerificationEnabled = item.setting_value;
      break;
  }
});

console.log('\nProcessed settings:');
console.log('  phoneEnabled:', settings.phoneEnabled);
console.log('  phoneVerificationEnabled:', settings.phoneVerificationEnabled);
console.log('\nExpected: Both should be false');
