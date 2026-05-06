"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Bell, BellOff, Check, CheckCheck, Trash2, Calendar, 
    Mail, Award, AlertCircle, Clock, Sparkles, Filter,
    ChevronDown, AlertTriangle
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
    missed_interview: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    streak_milestone: { icon: Award, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    system: { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-500/10" },
};

const FILTER_OPTIONS = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Schedules", value: "schedule_confirmed" },
    { label: "Reminders", value: "reminder_sent" },
    { label: "Missed", value: "missed_interview" },
    { label: "Completed", value: "interview_completed" },
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
        <div className="space-y-8">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-[32px] p-6 text-center backdrop-blur-xl shadow-sm dark:shadow-none transition-transform hover:scale-[1.02]">
                    <p className="text-4xl font-black text-[var(--text-primary)] leading-none">{notifications.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-2">Total Notifications</p>
                </div>
                <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-[32px] p-6 text-center backdrop-blur-xl shadow-sm dark:shadow-none transition-transform hover:scale-[1.02]">
                    <p className="text-4xl font-black text-orange-600 dark:text-orange-500 leading-none">{unreadCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-2">Unread Messages</p>
                </div>
                <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-[32px] p-6 text-center backdrop-blur-xl shadow-sm dark:shadow-none transition-transform hover:scale-[1.02]">
                    <p className="text-4xl font-black text-emerald-600 dark:text-emerald-500 leading-none">{notifications.length - unreadCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-2">Read Sessions</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-[var(--surface-card)] backdrop-blur-3xl border border-[var(--border-primary)] p-4 sm:p-5 rounded-[32px] shadow-sm dark:shadow-none overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[var(--text-muted)] whitespace-nowrap">
                            <Filter size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Filter</span>
                        </div>
                        
                        {/* Scrollable Container with Fade Mask */}
                        <div className="relative flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0 scroll-smooth">
                                {FILTER_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFilter(opt.value)}
                                        className={cn(
                                            "relative px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 group",
                                            filter === opt.value 
                                                ? "text-white" 
                                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        <span className="relative z-10">{opt.label}</span>
                                        {filter === opt.value ? (
                                            <motion.div
                                                layoutId="activeFilter"
                                                className="absolute inset-0 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-[var(--surface-base)] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                ))}
                                {/* Buffer for the right fade */}
                                <div className="min-w-[20px] h-1" />
                            </div>
                            {/* Inner Fades */}
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--surface-card)] to-transparent pointer-events-none hidden sm:block" />
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <div className="flex-shrink-0">
                            <button
                                onClick={handleMarkAllRead}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all active:scale-95 whitespace-nowrap shadow-sm shadow-blue-500/5"
                            >
                                <CheckCheck size={16} />
                                Mark All Read
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-[32px] backdrop-blur-xl shadow-sm dark:shadow-none"
                        >
                            <BellOff className="mx-auto h-12 w-12 text-[var(--text-muted)] opacity-20 mb-4" />
                            <h3 className="text-lg font-bold text-[var(--text-primary)] opacity-40 mb-2">
                                {filter === "unread" ? "All caught up!" : "No notifications yet"}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] font-medium max-w-sm mx-auto">
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
                                        "group relative bg-[var(--surface-card)] border rounded-[24px] p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-lg",
                                        notification.read 
                                            ? "border-[var(--border-subtle)] opacity-70 hover:opacity-100" 
                                            : "border-[var(--border-primary)] hover:border-[var(--text-muted)] shadow-sm"
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
                                                        ? "font-semibold text-[var(--text-secondary)]" 
                                                        : "font-bold text-[var(--text-primary)]"
                                                )}>
                                                    {notification.title.replace("✅", "")}
                                                </h3>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
                                                        {dayjs(notification.createdAt).fromNow()}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed mb-3">
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
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-base)] hover:bg-red-600 dark:hover:bg-red-500/10 text-[11px] font-bold text-[var(--text-secondary)] hover:text-white dark:hover:text-red-400 transition-all border border-[var(--border-subtle)] dark:border-transparent hover:border-red-600 dark:hover:border-red-500/10"
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
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
                        {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} • PrepEdge
                    </p>
                </div>
            )}
        </div>
    );
}
