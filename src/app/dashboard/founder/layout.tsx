import { redirect } from "next/navigation";

import { protectPage, getSession } from "@/lib/auth-checks";

/**
 * Server-side RBAC protection for all /dashboard/founder/* routes.
 * Role is fetched from the database — cannot be spoofed client-side.
 * Allows verified FOUNDER and ADMIN accounts.
 * Redirects anonymous users to sign-in with returnUrl.
 * Redirects unauthorized logged-in roles (e.g. STUDENT) to student dashboard.
 */
export default async function FounderLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSession();

  if (!sessionUser) {
    redirect("/auth/sign-in?returnUrl=/dashboard/founder");
  }

  const { authorized } = await protectPage(["FOUNDER", "ADMIN"]);

  if (!authorized) {
    redirect("/dashboard/student");
  }

  return <>{children}</>;
}
