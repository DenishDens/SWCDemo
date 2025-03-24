const fs = require('fs');
const { execSync } = require('child_process');

// Get the Supabase configuration
const supabaseOutput = execSync('supabase status').toString();
let anonKey = '';
let url = '';

// Parse the output to extract the keys
const lines = supabaseOutput.split('\n');
for (const line of lines) {
  if (line.includes('API URL:')) {
    url = line.split('API URL:')[1].trim();
  }
  if (line.includes('anon key:')) {
    anonKey = line.split('anon key:')[1].trim();
  }
}

// Create or update .env.local file
const envContent = `
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
`;

fs.writeFileSync('.env.local', envContent.trim());

console.log('Environment variables set up successfully:');
console.log(`NEXT_PUBLIC_SUPABASE_URL=${url}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`); 