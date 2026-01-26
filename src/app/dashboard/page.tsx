import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Redirect based on user's role
    const role = session.user.role || "STUDENT";

    if (role === "CLIENT") {
        redirect("/dashboard/client");
    }

    redirect("/dashboard/student");
}
