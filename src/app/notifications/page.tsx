import type { Metadata } from "next"
import NotificationsClient from "./NotificationsClient"

export const metadata: Metadata = {
  title: "Notifications — CampusConnect",
  description: "All your gig updates, payment releases, and platform activity in one place.",
}

export default function NotificationsPage() {
  return <NotificationsClient />
}
