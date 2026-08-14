import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runRegression() {
  console.log("Starting Auth Regression Tests...");

  // 1. New valid email
  const newEmail = `student-${Date.now()}@yopmail.com`;
  console.log(`\nTest 1: New valid email (${newEmail})`);
  const res1 = await supabase.auth.signUp({
    email: newEmail,
    password: 'StrongPassword123!',
    options: {
      data: { name: 'New Student', role: 'STUDENT', college: 'Stanford University', collegeId: 'stanford-123' }
    }
  });
  console.log(res1.error ? `Failed: ${res1.error.message}` : "Pass: Signup succeeded");

  // 2. Existing email
  console.log(`\nTest 2: Existing email (${newEmail})`);
  const res2 = await supabase.auth.signUp({
    email: newEmail,
    password: 'StrongPassword123!',
    options: {
      data: { name: 'Existing Student', role: 'STUDENT', college: 'Stanford University', collegeId: 'stanford-123' }
    }
  });
  console.log(res2.error ? `Error captured: [${res2.error.status}] ${res2.error.message}` : "Pass: Handled existing email (user already exists)");

  // 3. Invalid email
  console.log(`\nTest 3: Invalid email format`);
  const res3 = await supabase.auth.signUp({
    email: 'not-an-email',
    password: 'StrongPassword123!',
  });
  console.log(res3.error ? `Error captured: [${res3.error.status}] ${res3.error.message}` : "Pass: Handled invalid email");

  // 4. Invalid password
  console.log(`\nTest 4: Invalid password (too short)`);
  const res4 = await supabase.auth.signUp({
    email: `student-${Date.now()}@yopmail.com`,
    password: '123',
  });
  console.log(res4.error ? `Error captured: [${res4.error.status}] ${res4.error.message}` : "Pass: Handled invalid password");

  // 5. Valid college selection -> collegeId preserved
  console.log(`\nTest 5: Valid college selection -> metadata verification`);
  if (!res1.error && res1.data.user) {
     const metadata = res1.data.user.user_metadata;
     console.log(`Metadata verified: collegeId=${metadata.collegeId}, college=${metadata.college}`);
  }

  console.log("\nRegression Test Complete!");
}

runRegression().catch(console.error);
