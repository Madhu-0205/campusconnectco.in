import { redirect } from "next/navigation";

// Platform metrics consolidated under Analytics
export default function MetricsPage() {
    redirect("/dashboard/founder/analytics");
}
