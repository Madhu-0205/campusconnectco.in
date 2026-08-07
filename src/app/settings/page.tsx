import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export default async function SettingsRedirect() {
    const auth = await getSession();
    if (!auth?.id) redirect("/auth/sign-in");

    const user = await prisma.user.findUnique({
        where: { id: auth.id },
        select: { role: true }
    });

    if (user?.role === "STUDENT") {
        redirect("/dashboard/student/settings");
    } else if (user?.role === "FOUNDER") {
        redirect("/dashboard/founder/settings");
    } else if (user?.role === "COLLEGE") {
        redirect("/dashboard/college/settings");
    } else {
        redirect("/dashboard");
    }

    return null;
}
