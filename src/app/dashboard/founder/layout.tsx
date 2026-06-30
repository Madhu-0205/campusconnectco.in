import { protectPage } from "@/lib/auth-checks";
import { redirect } from "next/navigation";

/**
 * Server-side RBAC protection for all /dashboard/founder/* routes.
 * Role is fetched from the database — cannot be spoofed client-side.
 */
export default async function FounderLayout({ children }: { children: React.ReactNode }) {
    const { authorized } = await protectPage(["FOUNDER"]);

    if (!authorized) {
        redirect("/dashboard/student");
    }

    return <>{children}</>;
}
