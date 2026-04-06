"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Bell, BellOff, Check, CheckCheck, Trash2, Calendar, 
    Mail, Award, AlertCircle, Clock, Sparkles, Filter,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification
} from "@/lib/actions/notifications.action";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    metadata?: Record<string, any>;
}

const NOTIFICATION_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
    welcome: { icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
    schedule_confirmed: { icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10" },
    reminder_sent: { icon: Bell, color: "text-orange-400", bg: "bg-orange-500/10" },
    interview_completed: { icon: Award, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    streak_milestone: { icon: Award, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    system: { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-500/10" },
};

const FILTER_OPTIONS = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Schedules", value: "schedule_confirmed" },
    { label: "Reminders", value: "reminder_sent" },
    { label: "Welcome", value: "welcome" },
];

export default function NotificationsClient({ 
    initialNotifications, 
    initialUnreadCount 
}: { 
    initialNotifications: Notification[]; 
    initialUnreadCount: number;
}) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [filter, setFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.read;
        return n.type === filter;
    });

    const handleMarkAsRead = async (id: string) => {
        setLoadingId(id);
        try {
            const res = await markNotificationAsRead(id);
            if (res.success) {
                setNotifications(prev => 
                    prev.map(n => n.id === id ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch {
            toast.error("Failed to mark as read.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await markAllNotificationsAsRead();
            if (res.success) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
                toast.success(`Marked ${res.count} notifications as read.`);
            }
        } catch {
            toast.error("Failed to mark all as read.");
        }
    };

    const handleDelete = async (id: string) => {
        setLoadingId(id);
        try {
            const res = await deleteNotification(id);
            if (res.success) {
                const wasUnread = notifications.find(n => n.id === id)?.read === false;
                setNotifications(prev => prev.filter(n => n.id !== id));
                if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
                toast.success("Notification deleted.");
            }
        } catch {
            toast.error("Failed to delete.");
        } finally {
            setLoadingId(null);
        }
    };

    const getNotificationIcon = (type: string) => {
        return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.system;
    };

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[24px] p-5 text-center backdrop-blur-xl shadow-sm dark:shadow-none">
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{notifications.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">Total</p>
                </div>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[24px] p-5 text-center backdrop-blur-xl shadow-sm dark:shadow-none">
                    <p className="text-3xl font-black text-orange-600 dark:text-orange-500">{unreadCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">Unread</p>
                </div>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[24px] p-5 text-center backdrop-blur-xl shadow-sm dark:shadow-none">
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-500">{notifications.length - unreadCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">Read</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-white/[0.03] backdrop-blur-3xl border border-gray-200 dark:border-white/10 p-4 rounded-[24px] shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                        >
                            <Filter size={14} />
                            {FILTER_OPTIONS.find(f => f.value === filter)?.label || "All"}
                            <ChevronDown size={14} className={cn("transition-transform", showFilters && "rotate-180")} />
                        </button>
                        
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#0d0d12]/95 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-3xl z-50 overflow-hidden"
                                >
                                    {FILTER_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setFilter(opt.value); setShowFilters(false); }}
                                            className={cn(
                                                "w-full text-left px-4 py-3 text-sm font-medium transition-all",
                                                filter === opt.value 
                                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-blue-500/10 border border-transparent dark:border-blue-500/20 rounded-xl text-sm font-bold text-white dark:text-blue-400 hover:bg-blue-700 dark:hover:bg-blue-500/20 transition-all active:scale-95 shadow-md shadow-blue-500/20 dark:shadow-none"
                    >
                        <CheckCheck size={16} />
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[32px] backdrop-blur-xl shadow-sm dark:shadow-none"
                        >
                            <BellOff className="mx-auto h-12 w-12 text-gray-300 dark:text-white/15 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white/40 mb-2">
                                {filter === "unread" ? "All caught up!" : "No notifications yet"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-white/20 font-medium max-w-sm mx-auto">
                                {filter === "unread" 
                                    ? "You've read all your notifications. Great job staying on top of things!" 
                                    : "When you schedule interviews or receive reminders, they'll appear here."
                                }
                            </p>
                        </motion.div>
                    ) : (
                        filteredNotifications.map((notification, index) => {
                            const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                            const isLoading = loadingId === notification.id;

                            return (
                                <motion.div
                                    key={notification.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100, scale: 0.9 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={cn(
                                        "group relative bg-white dark:bg-white/[0.02] border rounded-[24px] p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-lg",
                                        notification.read 
                                            ? "border-gray-100 dark:border-white/5 opacity-70 hover:opacity-100" 
                                            : "border-gray-200 dark:border-white/15 hover:border-gray-300 dark:hover:border-white/25 shadow-sm"
                                    )}
                                >
                                    {/* Unread Indicator Bar */}
                                    {!notification.read && (
                                        <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
                                    )}

                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={cn("flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center", bg)}>
                                            <Icon size={22} className={color} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <h3 className={cn(
                                                    "text-base tracking-tight",
                                                    notification.read 
                                                        ? "font-semibold text-gray-700 dark:text-gray-300" 
                                                        : "font-bold text-gray-900 dark:text-white"
                                                )}>
                                                    {notification.title.replace("✅", "")}
                                                </h3>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                        {dayjs(notification.createdAt).fromNow()}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-3">
                                                {notification.message}
                                            </p>

                                            {/* Metadata Tags */}
                                            {notification.metadata && (notification.metadata.date || notification.metadata.time) && (
                                                <div className="flex items-center gap-2 flex-wrap mb-3">
                                                    {notification.metadata.date && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/10 text-[11px] font-bold text-blue-400">
                                                            <Calendar size={11} />
                                                            {dayjs(notification.metadata.date).format("MMM DD, YYYY")}
                                                        </span>
                                                    )}
                                                    {notification.metadata.time && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/10 text-[11px] font-bold text-indigo-400">
                                                            <Clock size={11} />
                                                            {notification.metadata.time}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        disabled={isLoading}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-blue-600 dark:hover:bg-blue-500/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-white dark:hover:text-blue-400 transition-all border border-gray-200 dark:border-transparent hover:border-blue-600 dark:hover:border-blue-500/10"
                                                    >
                                                        <Check size={12} />
                                                        Mark read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    disabled={isLoading}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-red-600 dark:hover:bg-red-500/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-white dark:hover:text-red-400 transition-all border border-gray-200 dark:border-transparent hover:border-red-600 dark:hover:border-red-500/10"
                                                >
                                                    <Trash2 size={12} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Read status indicator dot */}
                                    {notification.read && (
                                        <div className="absolute top-5 right-5">
                                            <CheckCheck size={14} className="text-emerald-500/40" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom fade text */}
            {filteredNotifications.length > 0 && (
                <div className="text-center pt-4 pb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/15">
                        {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} • PrepEdge
                    </p>
                </div>
            )}
        </div>
    );
}
