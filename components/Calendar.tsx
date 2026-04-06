"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, Trash2, Bell, AlertCircle, Loader2, X, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { addSchedule, deleteSchedule, getSchedules, sendManualReminder } from "@/lib/actions/schedules.action";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Schedule {
  id: string;
  date: string;
  time?: string;
  status: "pending" | "done";
}

export const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Time Picker Modal State
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedHour, setSelectedHour] = useState(10);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const data = await getSchedules();
            setSchedules(data as Schedule[]);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const daysInMonth = currentMonth.daysInMonth();
    const firstDayOfMonth = currentMonth.startOf("month").day();
    const monthName = currentMonth.format("MMMM");
    const year = currentMonth.format("YYYY");

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
    const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

    const isScheduled = (day: number) => {
        const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
        return schedules.find(s => s.date === dateStr);
    };

    const openTimePicker = (day: number) => {
        const existing = isScheduled(day);
        if (existing) {
            toast.info(`Already scheduled on ${currentMonth.date(day).format("YYYY-MM-DD")}`);
            return;
        }
        setSelectedDay(day);
        setSelectedHour(10);
        setSelectedMinute(0);
        setSelectedPeriod("AM");
        setShowTimePicker(true);
    };

    const formatTimeString = () => {
        const h = selectedHour.toString().padStart(2, "0");
        const m = selectedMinute.toString().padStart(2, "0");
        return `${h}:${m} ${selectedPeriod}`;
    };

    const handleConfirmSchedule = async () => {
        if (selectedDay === null) return;
        const dateStr = currentMonth.date(selectedDay).format("YYYY-MM-DD");
        const timeStr = formatTimeString();

        setShowTimePicker(false);
        setActionLoading(dateStr);
        try {
            const res = await addSchedule(dateStr, timeStr);
            if (res.success) {
                toast.success(`Scheduled for ${dateStr} at ${timeStr}! Confirmation email sent.`);
                await fetchSchedules();
            } else {
                toast.error(res.message || "Failed to schedule.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setActionLoading(null);
            setSelectedDay(null);
        }
    };

    const incrementHour = () => setSelectedHour(prev => (prev === 12 ? 1 : prev + 1));
    const decrementHour = () => setSelectedHour(prev => (prev === 1 ? 12 : prev - 1));
    const incrementMinute = () => setSelectedMinute(prev => (prev === 55 ? 0 : prev + 5));
    const decrementMinute = () => setSelectedMinute(prev => (prev === 0 ? 55 : prev - 5));
    const togglePeriod = () => setSelectedPeriod(prev => (prev === "AM" ? "PM" : "AM"));

    const handleDelete = async (e: React.MouseEvent, scheduleId: string) => {
        e.stopPropagation();
        setIdToDelete(scheduleId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        const scheduleId = idToDelete;
        setShowDeleteModal(false);
        setIdToDelete(null);
        
        setActionLoading(scheduleId);
        try {
            const res = await deleteSchedule(scheduleId);
            if (res.success) {
                toast.success("Schedule removed.");
                await fetchSchedules();
            }
        } catch (error) {
            toast.error("Failed to delete.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReminder = async (e: React.MouseEvent, date: string, time?: string) => {
        e.stopPropagation();
        toast.promise(sendManualReminder(date, time), {
            loading: 'Sending reminder email...',
            success: 'Reminder email sent successfully!',
            error: 'Failed to send reminder email.'
        });
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Time Picker Modal */}
            <AnimatePresence>
                {showTimePicker && selectedDay !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowTimePicker(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-[92vw] max-w-md bg-white/10 dark:bg-[#0a0a14]/90 backdrop-blur-3xl border border-white/15 rounded-[32px] p-8 shadow-2xl shadow-blue-500/10"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowTimePicker(false)}
                                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            >
                                <X size={18} />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                    <Clock size={12} />
                                    Set Interview Time
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {currentMonth.date(selectedDay).format("MMMM DD, YYYY")}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                    Choose when you want to practice
                                </p>
                            </div>

                            {/* Time Picker Controls */}
                            <div className="flex items-center justify-center gap-4 mb-8">
                                {/* Hour */}
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={incrementHour}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                                    >
                                        <ChevronUp size={18} />
                                    </button>
                                    <div className="h-[72px] w-[72px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <span className="text-3xl font-black text-white tabular-nums">
                                            {selectedHour.toString().padStart(2, "0")}
                                        </span>
                                    </div>
                                    <button
                                        onClick={decrementHour}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hour</span>
                                </div>

                                {/* Colon Separator */}
                                <div className="flex flex-col items-center justify-center h-[72px] pb-8">
                                    <span className="text-3xl font-black text-blue-500 animate-pulse">:</span>
                                </div>

                                {/* Minute */}
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={incrementMinute}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                                    >
                                        <ChevronUp size={18} />
                                    </button>
                                    <div className="h-[72px] w-[72px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <span className="text-3xl font-black text-white tabular-nums">
                                            {selectedMinute.toString().padStart(2, "0")}
                                        </span>
                                    </div>
                                    <button
                                        onClick={decrementMinute}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Min</span>
                                </div>

                                {/* AM/PM Toggle */}
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={togglePeriod}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                                    >
                                        <ChevronUp size={18} />
                                    </button>
                                    <div className="h-[72px] w-[72px] rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <span className="text-xl font-black text-blue-400">
                                            {selectedPeriod}
                                        </span>
                                    </div>
                                    <button
                                        onClick={togglePeriod}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Period</span>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Your Interview Time</p>
                                <p className="text-lg font-bold text-white">
                                    {currentMonth.date(selectedDay).format("MMM DD")} at{" "}
                                    <span className="text-blue-400">{formatTimeString()}</span>
                                </p>
                            </div>

                            {/* Confirm Button */}
                            <button
                                onClick={handleConfirmSchedule}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                            >
                                Confirm & Schedule
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Calendar Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-white/5 dark:bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <CalendarIcon className="text-blue-500 h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {monthName} <span className="text-blue-500">{year}</span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Plan your growth path</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative z-10 bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10">
                    <button 
                        onClick={handlePrevMonth}
                        className="p-2.5 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all hover:scale-110 active:scale-95 text-gray-700 dark:text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-4 w-px bg-gray-300 dark:bg-white/10 mx-1" />
                    <button 
                        onClick={handleNextMonth}
                        className="p-2.5 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all hover:scale-110 active:scale-95 text-gray-700 dark:text-white"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Calendar View */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 dark:bg-white/[0.02] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
                        <div className="grid grid-cols-7 mb-6">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="text-center text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-3">
                            {emptyDays.map((i) => (
                                <div key={`empty-${i}`} className="aspect-square" />
                            ))}
                            {days.map((day) => {
                                const schedule = isScheduled(day);
                                const isToday = dayjs().isSame(currentMonth.date(day), 'day');
                                const isPast = dayjs().isAfter(currentMonth.date(day), 'day') && !isToday;
                                
                                return (
                                    <motion.button
                                        key={day}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => openTimePicker(day)}
                                        disabled={isPast}
                                        className={cn(
                                            "relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border group",
                                            isToday ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/25" : 
                                            schedule ? "bg-white/10 dark:bg-white/5 border-white/10 text-gray-900 dark:text-white" : 
                                            "bg-transparent border-transparent hover:border-white/20 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5",
                                            isPast && "opacity-30 cursor-not-allowed hover:bg-transparent hover:border-transparent"
                                        )}
                                    >
                                        <span className="text-lg font-bold">{day}</span>
                                        {schedule && (
                                            <>
                                                <div className={cn(
                                                    "absolute bottom-2 h-1.5 w-1.5 rounded-full",
                                                    schedule.status === "done" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                                                )} />
                                                {schedule.time && (
                                                    <span className={cn(
                                                        "text-[8px] font-bold mt-0.5 leading-none",
                                                        isToday ? "text-white/80" : "text-blue-400/80"
                                                    )}>
                                                        {schedule.time}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                        
                                        {actionLoading === currentMonth.date(day).format("YYYY-MM-DD") && (
                                            <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                                                <Loader2 size={16} className="animate-spin text-white" />
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
                        <div className="absolute top-0 right-0 -m-8 h-48 w-48 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Interview Success Track</h3>
                                <p className="text-blue-100 text-sm font-medium opacity-80">
                                    You have <span className="font-bold underline">{schedules.filter(s => s.status === 'pending').length} upcoming</span> sessions planned.
                                </p>
                            </div>
                            <div className="flex -space-x-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-12 w-12 rounded-2xl border-4 border-white/20 bg-blue-400 overflow-hidden shadow-xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Upcoming & Legend */}
                <div className="space-y-6">
                    <div className="bg-white/5 dark:bg-white/[0.02] border border-white/10 rounded-[32px] p-6 backdrop-blur-xl flex flex-col gap-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 px-2 flex items-center justify-between">
                            Scheduled Events
                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                        </h3>
                        
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {schedules.length === 0 ? (
                                    <div className="text-center py-12 px-4 border-2 border-dashed border-white/5 rounded-[24px]">
                                        <AlertCircle className="mx-auto h-8 w-8 text-white/20 mb-3" />
                                        <p className="text-xs text-white/30 font-bold uppercase tracking-tight">No interviews scheduled yet</p>
                                    </div>
                                ) : (
                                    schedules
                                    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())
                                    .map((s) => (
                                        <motion.div
                                            key={s.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group relative bg-white/5 hover:bg-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-white/10 rounded-2xl p-4 transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                                        s.status === "done" ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
                                                    )}>
                                                        {s.status === "done" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
                                                            {dayjs(s.date).format("MMM DD, YYYY")}
                                                        </p>
                                                        {s.time && (
                                                            <p className="text-[11px] font-bold text-blue-400 flex items-center gap-1 mt-0.5">
                                                                <Clock size={10} />
                                                                {s.time}
                                                            </p>
                                                        )}
                                                        <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-60", s.status === 'done' ? 'text-emerald-400' : 'text-amber-400')}>
                                                            {s.status}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => handleReminder(e, s.date, s.time)}
                                                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                                        title="Send Reminder Email"
                                                    >
                                                        <Bell size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleDelete(e, s.id)}
                                                        className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                                        title="Cancel Schedule"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Status Legend */}
                    <div className="bg-white/5 dark:bg-white/[0.02] border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Status Key</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-amber-400" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Scheduled (Pending)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Interview Completed</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Current Day</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <AlertDialogContent className="border-red-500/20">
                    <AlertDialogHeader>
                        <div className="mx-auto sm:mx-0 h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
                            <AlertCircle className="text-red-500 h-7 w-7" />
                        </div>
                        <AlertDialogTitle className="text-3xl font-black tracking-tight">Cancel Schedule?</AlertDialogTitle>
                        <AlertDialogDescription className="text-lg">
                            Are you sure you want to cancel this scheduled interview? This action cannot be undone and your reminder emails will be stopped.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="h-14 rounded-2xl text-base">Keep Schedule</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-base font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                        >
                            Confirm Cancel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
