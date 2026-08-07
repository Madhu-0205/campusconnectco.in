import { redirect } from "next/navigation";

import { protectPage } from "@/lib/auth-checks";

export default async function CollegeLayout({ children }: { children: React.ReactNode }) {
    const { authorized, role } = await protectPage(["COLLEGE", "FOUNDER"]);

    if (!authorized) {
        redirect("/auth/sign-in");
    }

    // Since Founders have their own dashboard, prevent them from casually browsing
    // the college dashboard unless we have a preview mode. We'll just enforce COLLEGE here.
    if (role !== "COLLEGE") {
        redirect("/dashboard");
    }

    return <>{children}</>;
}
