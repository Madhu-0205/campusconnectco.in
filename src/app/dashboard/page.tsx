import { redirect } from"next/navigation";

import { getSession, getUserRoleFromDb } from"@/lib/auth-checks";

export default async function DashboardRedirect() {
 const user = await getSession();

 if (!user) {
 redirect("/auth/sign-in");
 }

 const role = await getUserRoleFromDb(user.id);

 if (role ==="FOUNDER") {
 redirect("/dashboard/founder");
 }

 if (role ==="CLIENT" || role ==="STARTUP") {
 redirect("/client-hub");
 }

 redirect("/dashboard/student");
}
