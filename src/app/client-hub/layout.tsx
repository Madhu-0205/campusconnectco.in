import { cookies } from"next/headers";
import { redirect } from"next/navigation";

import { getSession, getUserRoleFromDb } from"@/lib/auth-checks";

import ClientLayout from"../dashboard/ClientLayout";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
 const user = await getSession();

 // 1. SESSION PROTECTION (Requirement 1.B)
 if (!user) {
 redirect("/auth/sign-in");
 }

 // 2. FETCH ROLE FROM DATABASE (Requirement 8 - STRICT)
 const role = await getUserRoleFromDb(user.id);

 if (!role) {
 redirect("/auth/sign-in");
 }

 const cookieStore = await cookies();
 const isPreviewMode = (await cookieStore).get('admin_preview_mode')?.value === 'true';

 // 3. SECURE PASSING TO CLIENT LAYOUT
 return (
 <ClientLayout initialRole={role as string} isPreviewMode={isPreviewMode}>
 {children}
 </ClientLayout>
 );
}
