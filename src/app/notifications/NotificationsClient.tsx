"use client"
import { motion, AnimatePresence } from"framer-motion"
import {
 Bell, CheckCheck, Briefcase, CreditCard, Settings2, Zap,
 MessageSquare, X
} from"lucide-react"
import { useRouter } from "next/navigation"
import { useState } from"react"

import { fadeUp, staggerContainer, listItem } from"@/lib/animations"

export interface NotificationItem {
 id: string
 type: string
 title: string
 description: string
 time: string
 read: boolean
 link?: string | null
}

const getIconForType = (type: string) => {
 switch (type) {
 case"payment": return <CreditCard size={18} />;
 case"match": return <Zap size={18} />;
 case"gig": return <Briefcase size={18} />;
 case"system": return <Settings2 size={18} />;
 case"message": return <MessageSquare size={18} />;
 default: return <Bell size={18} />;
 }
}

const getColorForType = (type: string) => {
 switch (type) {
 case"payment": return"text-emerald-500 bg-[#10B981]/15 border-[#10B981]/30";
 case"match": return"text-[#1FA971] bg-(--primary)/15 border-[#1FA971]/30";
 case"gig": return"text-[#0EA5E9] bg-[#0EA5E9]/15 border-[#0EA5E9]/30";
 case"system": return"text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30";
 case"message": return"text-[#EC4899] bg-[#EC4899]/15 border-[#EC4899]/30";
 default: return"text-gray-400 bg-gray-500/15 border-gray-500/30";
 }
}

const tabs = [
 { label:"All", key:"all", icon: Bell },
 { label:"Gigs", key:"gig", icon: Briefcase },
 { label:"Payments", key:"payment", icon: CreditCard },
 { label:"Matches", key:"match", icon: Zap },
 { label:"System", key:"system", icon: Settings2 },
]

export default function NotificationsClient({ initialNotifications = [] }: { initialNotifications?: NotificationItem[] }) {
 const router = useRouter()
 const [activeTab, setActiveTab] = useState<string>("all")
 const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)

 const filtered = activeTab ==="all"
 ? notifications
 : notifications.filter((n) => n.type === activeTab)

 const unreadCount = notifications.filter((n) => !n.read).length

 const markAllRead = async () => {
   const prevNotifications = [...notifications]
   setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

   try {
     const res = await fetch("/api/notifications", {
       method: "PATCH",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ id: "all" }),
     })
     if (!res.ok) {
       throw new Error("Failed to mark all notifications as read")
     }
   } catch (err) {
     console.error("[NOTIFICATIONS_MARK_ALL_READ_ERROR]:", err)
     setNotifications(prevNotifications)
   }
 }

 const markRead = async (id: string) => {
   const target = notifications.find((n) => n.id === id)
   if (!target || target.read) return

   const prevNotifications = [...notifications]
   setNotifications((prev) =>
     prev.map((n) => (n.id === id ? { ...n, read: true } : n))
   )

   try {
     const res = await fetch("/api/notifications", {
       method: "PATCH",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ id }),
     })
     if (!res.ok) {
       throw new Error("Failed to mark notification as read")
     }
   } catch (err) {
     console.error("[NOTIFICATIONS_MARK_READ_ERROR]:", err)
     setNotifications(prevNotifications)
   }
 }

 const dismiss = async (id: string) => {
   const prevNotifications = [...notifications]
   setNotifications((prev) => prev.filter((n) => n.id !== id))

   try {
     const res = await fetch("/api/notifications", {
       method: "PATCH",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ id }),
     })
     if (!res.ok) {
       throw new Error("Failed to dismiss notification")
     }
   } catch (err) {
     console.error("[NOTIFICATIONS_DISMISS_ERROR]:", err)
     setNotifications(prevNotifications)
   }
 }

 return (
    <div
      className="min-h-screen bg-[#FAFCFA] text-slate-900 py-10 px-4 sm:px-6"
      style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1
                  className="text-3xl font-black text-slate-900"
                  style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
                >
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-[#1FA971] text-white text-xs font-black rounded-full shadow-sm">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium">All your gig updates, milestones, and match alerts</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 px-4 py-2 font-bold text-xs text-slate-700 hover:text-primary bg-white border border-gray-200 hover:border-primary/40 rounded-xl transition-all shadow-sm"
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
            )}
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeUp} className="flex gap-1 mt-6 bg-slate-100 border border-gray-200 rounded-2xl p-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const tabCount = tab.key === "all"
                ? unreadCount
                : notifications.filter((n) => n.type === tab.key && !n.read).length
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.key 
                      ? "bg-[#1FA971] text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {tabCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      activeTab === tab.key ? "bg-white/30 text-white" : "bg-[#1FA971]/20 text-[#1FA971]"
                    }`}>
                      {tabCount}
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Notification List */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Bell size={28} className="text-primary" />
              </div>
              <p className="font-bold text-lg text-slate-900 mb-2">All clear!</p>
              <p className="text-sm text-slate-500 font-medium">No {activeTab === "all" ? "" : activeTab} notifications yet. Check back soon.</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-2.5"
            >
              {filtered.map((notif) => (
                <motion.div
                  key={notif.id}
                  variants={listItem}
                  layout
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    notif.read 
                      ? "bg-slate-50/70 border-gray-100 hover:border-gray-200" 
                      : "bg-white border-gray-200 shadow-sm hover:border-[#1FA971]/40 hover:shadow-md"
                  }`}
                  onClick={() => {
                    markRead(notif.id)
                    if (notif.link) {
                      router.push(notif.link)
                    }
                  }}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="absolute top-4 left-2 w-2 h-2 rounded-full bg-[#1FA971] ring-2 ring-white" />
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getColorForType(notif.type)}`}>
                    {getIconForType(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold leading-tight ${notif.read ? "text-slate-600" : "text-slate-900"}`}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-slate-400 font-medium shrink-0 mt-0.5">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {notif.description}
                    </p>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(notif.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all shrink-0 mt-0.5"
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
 )
}
