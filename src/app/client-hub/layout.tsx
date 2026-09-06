import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSession, getUserRoleFromDb } from "@/lib/auth-checks";

import ClientLayout from "../dashboard/ClientLayout";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  // 1. SESSION PROTECTION
  if (!user) {
    redirect("/auth/sign-in?returnUrl=/client-hub");
  }

  // 2. FETCH ROLE FROM DATABASE (STRICT)
  const role = await getUserRoleFromDb(user.id);

  if (!role) {
    redirect("/auth/sign-in?returnUrl=/client-hub");
  }

  const normalizedRole = role.toUpperCase();

  // 3. STUDENT REDIRECT TO STUDENT DASHBOARD
  if (normalizedRole === "STUDENT") {
    redirect("/dashboard/student");
  }

  const cookieStore = await cookies();
  const isPreviewMode = cookieStore.get("admin_preview_mode")?.value === "true";

  // 4. SECURE PASSING TO CLIENT LAYOUT
  return (
    <ClientLayout initialRole={role as string} isPreviewMode={isPreviewMode}>
      {children}
    </ClientLayout>
  );
}
