import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing supabase env");
    return;
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const studentPassword = process.env.STUDENT_PASSWORD || "TestStudentPass123!";
  const { data, error } = await supabase.auth.admin.updateUserById(
    "2e754c36-9e3a-43f1-8587-cd08740877df",
    { password: studentPassword }
  );
  if (error) {
    console.error("Failed to update student password:", error.message);
  } else {
    console.log("Successfully updated student password for e2e_student@university.edu");
  }
}
main();
