"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, CheckCheck, Briefcase, CreditCard, Settings2, Zap,
  ShieldCheck, Star, TrendingUp, MessageSquare, X
} from "lucide-react"
import { fadeUp, staggerContainer, listItem } from "@/lib/animations"

type NotifType = "gig" | "payment" | "system" | "match" | "message"

interface Notification {
  id: string
  type: NotifType
  title: string
  description: string
  time: string
  read: boolean
  icon: React.ReactNode
  color: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "payment",
    title: "Payment Released! 🎉",
    description: "₹2,400 from Acme AI Studio has been released to your bank account. Great work on the React Frontend gig!",
    time: "2 minutes ago",
    read: false,
    icon: <CreditCard size={18} />,
    color: "text-emerald-500 bg-[#10B981]/15 border-[#10B981]/30",
  },
  {
    id: "2",
    type: "match",
    title: "New 94% AI Match Found",
    description: "CampusConnect AI found a new Razorpay internship that matches your React + Node.js skills. ₹8,000/month, remote.",
    time: "18 minutes ago",
    read: false,
    icon: <Zap size={18} />,
    color: "text-[#7C3AED] bg-(--primary)/15 border-[#7C3AED]/30",
  },
  {
    id: "3",
    type: "gig",
    title: "Application Accepted ✅",
    description: "IndieTech Studios accepted your application for 'UI/UX Design for Mobile App'. Escrow funds have been locked.",
    time: "1 hour ago",
    read: false,
    icon: <ShieldCheck size={18} />,
    color: "text-[#0EA5E9] bg-[#0EA5E9]/15 border-[#0EA5E9]/30",
  },
  {
    id: "4",
    type: "gig",
    title: "New Gig Posted — 89% Match",
    description: "A new 'Python Data Pipeline' gig has been posted by a YC-backed startup. Budget: ₹3,500. Deadline: 2 weeks.",
    time: "3 hours ago",
    read: false,
    icon: <Briefcase size={18} />,
    color: "text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30",
  },
  {
    id: "5",
    type: "message",
    title: "Message from Founders Nest",
    description: "\"Hi! We loved your profile. Would you be available for a 30-min call this week about our internship opening?\"",
    time: "5 hours ago",
    read: true,
    icon: <MessageSquare size={18} />,
    color: "text-(--primary-light) bg-[#A78BFA]/15 border-[#A78BFA]/30",
  },
  {
    id: "6",
    type: "gig",
    title: "Gig Completed & Reviewed ⭐",
    description: "Acme AI Studio left a 5-star review on your 'React Dashboard' gig. Your portfolio has been updated automatically.",
    time: "1 day ago",
    read: true,
    icon: <Star size={18} />,
    color: "text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30",
  },
  {
    id: "7",
    type: "system",
    title: "Profile Strength: 78%",
    description: "Add your LinkedIn profile and 2 more skills to reach 90% and unlock premium gig recommendations.",
    time: "2 days ago",
    read: true,
    icon: <TrendingUp size={18} />,
    color: "text-slate-400 bg-white/8 border-white/10",
  },
  {
    id: "8",
    type: "payment",
    title: "Escrow Locked — ₹1,800",
    description: "Payment for 'Content Writing — Batch 3' has been locked in escrow. You can start work now.",
    time: "3 days ago",
    read: true,
    icon: <ShieldCheck size={18} />,
    color: "text-emerald-500 bg-[#10B981]/15 border-[#10B981]/30",
  },
  {
    id: "9",
    type: "system",
    title: "Welcome to CampusConnect 2.0 🚀",
    description: "We've upgraded the platform! New AI career roadmap, SmartMatch v2, and faster escrow. Explore what's new.",
    time: "5 days ago",
    read: true,
    icon: <Settings2 size={18} />,
    color: "text-slate-400 bg-white/8 border-white/10",
  },
]

const tabs = [
  { label: "All", key: "all", icon: Bell },
  { label: "Gigs", key: "gig", icon: Briefcase },
  { label: "Payments", key: "payment", icon: CreditCard },
  { label: "Matches", key: "match", icon: Zap },
  { label: "System", key: "system", icon: Settings2 },
]

export default function NotificationsClient() {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const filtered = activeTab === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeTab)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div
      className="min-h-screen bg-background text-white py-10 px-4 sm:px-6"
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
                  className="text-3xl font-black"
                  style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
                >
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-[#7C3AED] text-xs font-black rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-sm">All your gig updates, payments, and matches</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 px-4 py-2 font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all"
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
            )}
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeUp} className="flex gap-1 mt-6 bg-(--surface-2) border border-white/8 rounded-2xl p-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const tabCount = tab.key === "all"
                ? unreadCount
                : notifications.filter((n) => n.type === tab.key && !n.read).length
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${ activeTab === tab.key ? "bg-[#7C3AED] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]" : "text-slate-400 hover:text-white" }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {tabCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full font-black ${ activeTab === tab.key ? "bg-white/30" : "bg-[#7C3AED]/20 text-(--primary-light)" }`}>
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
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-2xl bg-(--surface-2) border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Bell size={28} className="text-slate-600" />
              </div>
              <p className="font-bold text-lg mb-2">All clear!</p>
              <p className="text-sm">No {activeTab === "all" ? "" : activeTab} notifications yet. Check back soon.</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {filtered.map((notif) => (
                <motion.div
                  key={notif.id}
                  variants={listItem}
                  layout
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${ notif.read ? "bg-white/3" : "bg-(--surface) border-white/10 hover:border-white/20" }`}
                  onClick={() => markRead(notif.id)}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${notif.color}`}>
                    {notif.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold leading-tight ${notif.read ? "text-slate-300" : "text-white"}`}>
                        {notif.title}
                      </p>
                      <span className="text-slate-600 shrink-0 mt-0.5">{notif.time}</span>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed line-clamp-2">
                      {notif.description}
                    </p>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(notif.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-all shrink-0 mt-0.5"
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
