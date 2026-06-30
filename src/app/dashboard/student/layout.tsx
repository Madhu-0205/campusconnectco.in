import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { protectPage } from "@/lib/auth-checks";

/**
 * Server-side RBAC guard for all /dashboard/student/* routes.
 * - Students → allowed
 * - Founders in preview mode → allowed (preview cookie set)
 * - Founders NOT in preview → redirected to /dashboard/founder
 * - No session → redirected to /auth/sign-in
 */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
    const { authorized, role, user } = await protectPage(["STUDENT", "FOUNDER"]);

    if (!authorized) {
        if (user && role === "CLIENT") {
            redirect("/dashboard");
        } else {
            redirect("/auth/sign-in");
        }
    }

    // Founders can only access student routes in preview mode
    if (role === "FOUNDER") {
        const cookieStore = await cookies();
        const isPreview = cookieStore.get("admin_preview_mode")?.value === "true";
        if (!isPreview) {
            redirect("/dashboard/founder");
        }
    }

    return <>{children}</>;
}
