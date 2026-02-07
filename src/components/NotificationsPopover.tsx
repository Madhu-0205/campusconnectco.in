"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"

export default function NotificationsPopover() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([
        { id: 1, title: "New Gig Match", message: "A new gig matches your Python skills.", time: "2m ago", read: false },
        { id: 2, title: "Application Viewed", message: "Your application for 'React Dev' was viewed.", time: "1h ago", read: false },
        { id: 3, title: "Welcome!", message: "Welcome to CampusConnect.", time: "1d ago", read: true },
    ])
    const popoverRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    No notifications
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-slate-50 transition-colors relative group ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm ${!notification.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[10px] text-slate-400 font-medium">{notification.time}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed pr-6">
                                                {notification.message}
                                            </p>

                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                                        className="p-1 hover:bg-white rounded-full text-blue-500 shadow-sm border border-slate-100"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={12} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}
                                                    className="p-1 hover:bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm border border-slate-100"
                                                    title="Remove"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
                            <Button variant="ghost" className="text-xs w-full h-8 font-bold text-slate-500 hover:text-slate-900">
                                View All Activity
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
