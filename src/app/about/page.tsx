import type { Metadata } from "next"
import AboutClient from "./AboutClient"

export const metadata: Metadata = {
    title: "The Story of CampusConnect",
    description: "Our vision for the future of student collaboration.",
}

export default function AboutPage() {
    return <AboutClient />
}
