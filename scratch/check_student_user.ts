import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: { email: "e2e_student@university.edu" }
  });
  console.log("Prisma student user:", user ? { id: user.id, email: user.email, role: user.role } : "None");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const found = authUsers?.users.find(u => u.email === "e2e_student@university.edu");
    console.log("Supabase student auth user:", found ? { id: found.id, email: found.email } : "None");
  }
  await prisma.$disconnect();
}
main();
