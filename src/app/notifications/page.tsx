import type { Metadata } from"next"
import { redirect } from"next/navigation"

import { protectPage } from"@/lib/auth-checks"
import prisma from"@/lib/prisma"

import NotificationsClient from"./NotificationsClient"


export const metadata: Metadata = {
 title:"Notifications — CampusConnect",
 description:"All your gig updates, payment releases, and platform activity in one place.",
}

export default async function NotificationsPage() {
 const { user, authorized } = await protectPage(["FOUNDER","STUDENT","STARTUP","CLIENT"])

 if (!authorized || !user) {
 redirect("/auth/sign-in")
 }

 const notifications = await prisma.notification.findMany({
 where: { userId: user.id },
 orderBy: { createdAt:"desc" },
 take: 50,
 })

 // Serialize to match NotificationItem interface
 const serialized = notifications.map((n: any) => ({
 id: n.id,
 type: n.type,
 title: n.title,
 description: n.message,
 time: n.createdAt.toISOString(),
 read: n.isRead,
 }))

 return <NotificationsClient initialNotifications={serialized} />
}
