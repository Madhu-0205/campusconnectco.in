import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function confirmEmail() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npx tsx confirm_user.ts <email>');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  
  const maxRetries = 5;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      // Update the auth.users table directly using Prisma raw query
      const rowsUpdated = await prisma.$executeRaw`
        UPDATE auth.users
        SET email_confirmed_at = NOW()
        WHERE email = ${email};
      `;
      
      if (rowsUpdated > 0) {
        console.log(`Successfully confirmed email for ${email} on attempt ${i}`);
        process.exit(0);
      } else {
        console.log(`User ${email} not found in DB yet (attempt ${i}/${maxRetries}), waiting...`);
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    } catch (error) {
      console.error(`Error confirming user via DB on attempt ${i}:`, error);
      if (i === maxRetries) {
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.error(`Failed to confirm email for ${email}: user not found in database after ${maxRetries} attempts`);
  process.exit(1);
}

confirmEmail();
