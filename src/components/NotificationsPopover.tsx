"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Bell, CheckCheck, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"

interface NotificationsPopoverProps {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

interface Notification {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    link?: string;
    type: string;
}

function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // seconds
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPopover({
    isOpen = false,
    onOpenChange,
}: NotificationsPopoverProps) {

    const [notifications, setNotifications] = useState<Notification[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [userId, setUserId] = useState<string | null>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }

    // Initial setup and Realtime (Requirement 5.B)
    useEffect(() => {
        const supabase = createClient();

        async function setup() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                fetchNotifications();

                let retryCount = 0;
                const MAX_RETRIES = 5;

                // Listen for REAL-TIME database changes (Requirement 5)
                const channel = supabase
                    .channel(`user-notifications-${user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'Notification',
                            filter: `userId=eq.${user.id}`
                        },
                        (payload: { new: unknown }) => {
                            console.log('New notification received!', payload);
                            setNotifications(prev => [payload.new as Notification, ...prev]);
                        }
                    )
                
                const subscribeWithRetry = () => {
                    channel.subscribe((status, err) => {
                        if (status === 'SUBSCRIBED') {
                            retryCount = 0;
                        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                            if (retryCount < MAX_RETRIES) {
                                retryCount++;
                                setTimeout(() => {
                                    supabase.removeChannel(channel);
                                    subscribeWithRetry();
                                }, Math.min(1000 * Math.pow(2, retryCount), 10000));
                            }
                        }
                    });
                };
                
                subscribeWithRetry();

                return () => {
                    supabase.removeChannel(channel);
                }
            }

        }

        setup();
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node)
            ) {
                onOpenChange?.(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [onOpenChange])

    const unreadCount = notifications.filter(n => !n.isRead).length

    const markAsRead = async (id: string, link?: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            )
        )

        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                body: JSON.stringify({ id })
            });

            if (link) {
                onOpenChange?.(false);
                router.push(link);
            }
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    }

    const markAllAsRead = async () => {
        if (unreadCount === 0) return

        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        )

        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                body: JSON.stringify({ id: "all" })
            });
            toast.success("All notifications marked as read")
        } catch (e) {
            console.error(e);
        }
    }

    const clearAll = () => {
        // In real app, might want DELETE endpoint
        setNotifications([]);
        toast.success("Notifications cleared");
    }

    return (
        <div className="relative" ref={popoverRef}>

            {/* 🔔 Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenChange?.(!isOpen)}
                className={`relative p-2.5 rounded-full transition-all duration-300 ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' }`}
            >
                <Bell size={20} />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </motion.button>

            {/* 📦 Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-3 w-[360px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50"
                    >

                        {/* Header */}
                        <div className="px-4 py-3 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-foreground">
                                Notifications
                            </h3>

                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        className="h-8 w-8 p-0"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={14} />
                                    </Button>
                                )}

                                {notifications.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAll}
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                        title="Clear all"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[320px] overflow-y-auto">

                            {notifications.length === 0 ? (
                                <div className="p-8 text-slate-500 flex flex-col items-center gap-2">
                                    <Bell size={24} className="opacity-20" />
                                    <span>No notifications yet</span>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => markAsRead(n.id, n.link)}
                                        className={`p-4 border-slate-50 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className={`${!n.isRead ? "font-bold" : "font-semibold text-slate-600 dark:text-slate-400"}`}>
                                                {n.title}
                                            </h4>
                                            <span className="text-slate-400 whitespace-nowrap pt-1">
                                                {formatTime(n.createdAt)}
                                            </span>
                                        </div>

                                        <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                            {n.message}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/dashboard/student/messages")}
                                className="w-full text-xs font-semibold h-8"
                            >
                                View All Messages
                            </Button>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
