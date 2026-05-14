"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, 
  Gift, 
  Check,
  Trophy,
  ArrowLeft,
  X,
  MessageCircle,
  Linkedin,
  Twitter,
  Send,
  Copy,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock
} from "lucide-react";
import dayjs from "dayjs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StreakDetailProps {
  streakCount: number;
  activeDates: string[];
  userName: string;
}

const REWARDS = [
  { day: 7, coins: 10, label: "Consistency Kickstart", description: "You've unlocked your first major consistency reward!" },
  { day: 14, coins: 20, label: "Momentum Builder", description: "Two weeks strong! You're building a real habit." },
  { day: 50, coins: 30, label: "Habit Master", description: "50 days is the mark of a true dedicated learner." },
  { day: 100, coins: 50, label: "Streak Legend", description: "100 days! You are now in the top 1% of achievers." },
  { day: 200, coins: 50, label: "Elite Practitioner", description: "Outstanding perseverance. You're an elite member." },
  { day: 365, coins: 100, label: "The Legend of 365", description: "A full year of dedication. Absolutely legendary." },
];

const StreakDetail = ({ streakCount, activeDates, userName }: StreakDetailProps) => {
  const today = dayjs();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [viewDate, setViewDate] = useState(dayjs());
  
  // Weekly overview logic
  const weeklyDays = useMemo(() => {
    const days = [];
    const startOfWeek = today.startOf("week");
    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.add(i, "day");
      const iso = date.format("YYYY-MM-DD");
      days.push({
        label: date.format("dd").toUpperCase(),
        isToday: date.isSame(today, "day"),
        isActive: activeDates.includes(iso),
        date: iso
      });
    }
    return days;
  }, [activeDates, today]);

  // Calendar logic
  const currentMonthLabel = viewDate.format("MMMM YYYY");
  const daysInMonth = viewDate.daysInMonth();
  const startOffset = viewDate.startOf("month").day();
  
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const date = viewDate.date(i);
      const iso = date.format("YYYY-MM-DD");
      days.push({
        day: i,
        isActive: activeDates.includes(iso),
        isToday: date.isSame(today, "day")
      });
    }
    return days;
  }, [activeDates, today, daysInMonth, startOffset, viewDate]);

  const prevMonth = () => setViewDate(viewDate.subtract(1, "month"));
  const nextMonth = () => setViewDate(viewDate.add(1, "month"));

  // Find next milestone
  const nextMilestone = useMemo(() => {
    return REWARDS.find(r => r.day > streakCount) || REWARDS[REWARDS.length - 1];
  }, [streakCount]);

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://prepedge.com";
  const shareText = `I'm on a ${streakCount}-day streak on PrepEdge! 🚀 Join me in leveling up your career.`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const socialShares = [
    { name: "WhatsApp", icon: MessageCircle, color: "bg-[#25D366]", link: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}` },
    { name: "LinkedIn", icon: Linkedin, color: "bg-[#0077B5]", link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { name: "X", icon: Twitter, color: "bg-black", link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { name: "Telegram", icon: Send, color: "bg-[#0088CC]", link: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 pb-24">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
        </Link>
        <button 
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500 font-bold text-xs uppercase tracking-widest hover:bg-orange-500/20 transition-all active:scale-95"
        >
          <Share2 size={14} />
          Share
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - STATS & FLAME (4/12) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* MAIN STREAK DISPLAY */}
          <div className="bg-[var(--surface-card)] rounded-[3rem] border border-[var(--border-primary)] p-8 flex flex-col items-center text-center gap-6 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
            
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="relative"
              >
                <div className="absolute inset-0 blur-3xl bg-orange-500/30 rounded-full animate-pulse" />
                <svg width="200" height="200" viewBox="0 0 100 100" className="drop-shadow-[0_0_20px_rgba(249,115,22,0.4)] relative z-10">
                  <path d="M50 95 C 70 95, 85 75, 85 55 C 85 35, 70 10, 50 5 C 30 10, 15 35, 15 55 C 15 75, 30 95, 50 95 Z" fill="#FF8A00" />
                  <path d="M50 90 C 65 90, 75 75, 75 60 C 75 45, 65 25, 50 20 C 35 25, 25 45, 25 60 C 25 75, 35 90, 50 90 Z" fill="#FFB800" />
                  <path d="M50 85 C 60 85, 65 75, 65 65 C 65 55, 60 40, 50 35 C 40 40, 35 55, 35 65 C 35 75, 40 85, 50 85 Z" fill="#FFF500" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pt-8 z-20">
                  <span className="text-7xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                    {streakCount}
                  </span>
                </div>
              </motion.div>
            </div>

            <div className="space-y-1 relative z-10">
              <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{userName}&apos;s Fire</h1>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Days Consistent</h2>
            </div>
            
            <div className="w-full h-px bg-[var(--border-subtle)] my-2" />
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 bg-[var(--surface-base)] rounded-2xl border border-[var(--border-subtle)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Max Streak</p>
                <p className="text-xl font-black text-orange-500">{streakCount}</p>
              </div>
              <div className="p-4 bg-[var(--surface-base)] rounded-2xl border border-[var(--border-subtle)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Status</p>
                <p className="text-xl font-black text-emerald-500">Active</p>
              </div>
            </div>
          </div>

          {/* WEEKLY OVERVIEW (IN LEFT COL) */}
          <div className="bg-[var(--surface-card)] p-6 rounded-[2.5rem] border border-[var(--border-primary)] shadow-xl">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-6 text-center">Weekly Activity</h3>
             <div className="flex justify-between items-center px-2">
              {weeklyDays.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <span className={cn("text-[9px] font-black tracking-widest", day.isToday ? "text-orange-500" : "text-[var(--text-muted)]")}>
                    {day.label}
                  </span>
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 border",
                    day.isActive 
                      ? "bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                      : "bg-[var(--surface-base)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                  )}>
                    {day.isActive ? <Check size={18} strokeWidth={4} /> : <div className="w-1 h-1 rounded-full bg-current opacity-20" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - MILESTONES & CALENDAR (7/12) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* MILESTONES */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Upcoming Milestones</h3>
              <button 
                onClick={() => setShowRewardsModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] font-black text-orange-500 uppercase tracking-widest hover:bg-orange-500/20 transition-all group"
              >
                View All Rewards <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="bg-[var(--surface-card)] rounded-[3rem] border border-[var(--border-primary)] p-8 relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 -m-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy size={200} className="text-orange-500" />
              </div>
              
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-6xl font-black text-orange-500 tracking-tighter italic uppercase leading-none">Day {nextMilestone.day}</h4>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{nextMilestone.label}</p>
                  </div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] max-w-[280px] leading-relaxed">
                    Unlock a reward of <span className="font-bold text-orange-500">{nextMilestone.coins} PrepCoins</span> to use for your next mock interview sessions.
                  </p>
                </div>
                
                <div className="p-6 bg-orange-500/10 rounded-[2rem] border border-orange-500/20 shadow-inner">
                  <Gift size={64} className="text-orange-500" />
                </div>
              </div>

              <div className="mt-10 space-y-3 relative z-10">
                <div className="flex justify-between items-end">
                   <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Progress to Reward</span>
                   <span className="text-[11px] font-black text-orange-500 uppercase tracking-widest">{streakCount} / {nextMilestone.day} Days</span>
                </div>
                <div className="h-5 bg-[var(--surface-base)] rounded-full border border-[var(--border-subtle)] overflow-hidden p-1 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((streakCount / nextMilestone.day) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full relative shadow-lg"
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 bg-white rounded-full border-4 border-orange-500 shadow-xl" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* CALENDAR */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] px-2">Streak Calendar</h3>
            <div className="bg-[var(--surface-card)] rounded-[3rem] border border-[var(--border-primary)] p-8 shadow-xl">
              <div className="flex items-center justify-between mb-10 px-4">
                <button 
                  onClick={prevMonth}
                  className="p-2 hover:bg-[var(--surface-base)] rounded-xl text-[var(--text-muted)] hover:text-orange-500 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <h4 className="text-xl font-black uppercase tracking-widest text-[var(--text-primary)]">{currentMonthLabel}</h4>
                <button 
                  onClick={nextMonth}
                  className="p-2 hover:bg-[var(--surface-base)] rounded-xl text-[var(--text-muted)] hover:text-orange-500 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-4 sm:gap-y-8 text-center relative">
                {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map(day => (
                  <span key={day} className="text-[11px] font-black text-[var(--text-muted)] tracking-widest mb-4 opacity-50">{day}</span>
                ))}
                
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="h-12 w-12" />;
                  
                  return (
                    <div key={i} className="relative flex items-center justify-center h-12 w-full">
                      {day.isActive && (
                        <div className={cn(
                          "absolute inset-y-1 inset-x-0 bg-orange-500/15 z-0",
                          calendarDays[i-1]?.isActive && "left-[-50%]",
                          calendarDays[i+1]?.isActive && "right-[-50%]",
                          !calendarDays[i-1]?.isActive && "rounded-l-full",
                          !calendarDays[i+1]?.isActive && "rounded-r-full"
                        )} />
                      )}
                      
                      <div className={cn(
                        "relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-black transition-all",
                        day.isActive ? "text-orange-500" : "text-[var(--text-muted)]",
                        day.isToday && "bg-[var(--surface-base)] ring-2 ring-orange-500/50 text-[var(--text-primary)] shadow-xl"
                      )}>
                        {day.day}
                      </div>

                      {day.isActive && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500/10 z-[-1]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[var(--surface-card)] rounded-[2.5rem] border border-[var(--border-primary)] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowShareModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X size={24} />
                </button>
              </div>
              
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                   <Share2 className="text-orange-500" size={32} />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Share Achievement</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">Let the world know about your {streakCount} day streak!</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {socialShares.map((social) => (
                  <a 
                    key={social.name} 
                    href={social.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-[var(--surface-base)] transition-all group"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", social.color)}>
                      <social.icon size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{social.name}</span>
                  </a>
                ))}
              </div>

              <button 
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[var(--surface-card-alt)] transition-all active:scale-95"
              >
                <Copy size={16} />
                Copy Profile Link
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REWARDS MODAL */}
      <AnimatePresence>
        {showRewardsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRewardsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--surface-card)] rounded-[3rem] border border-[var(--border-primary)] p-8 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Milestone Rewards</h3>
                <button onClick={() => setShowRewardsModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {REWARDS.map((reward, i) => {
                  const isUnlocked = streakCount >= reward.day;
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "p-6 rounded-[2rem] border transition-all flex items-center justify-between gap-4",
                        isUnlocked 
                          ? "bg-orange-500/5 border-orange-500/20" 
                          : "bg-[var(--surface-base)] border-[var(--border-subtle)] opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                          isUnlocked ? "bg-orange-500 text-white" : "bg-[var(--surface-card)] text-[var(--text-muted)]"
                        )}>
                          {isUnlocked ? <Unlock size={24} /> : <Lock size={24} />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-orange-500 font-black text-xs uppercase tracking-widest">Day {reward.day}</span>
                            {isUnlocked && <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/20">Claimed</span>}
                          </div>
                          <h4 className="text-lg font-black text-[var(--text-primary)] leading-none">{reward.label}</h4>
                          <p className="text-xs font-medium text-[var(--text-secondary)]">{reward.coins} PrepCoins Reward</p>
                        </div>
                      </div>
                      <div className={cn(
                        "text-xl font-black italic uppercase tracking-tighter",
                        isUnlocked ? "text-orange-500" : "text-[var(--text-muted)]"
                      )}>
                        +{reward.coins}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-center text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                   <Gift size={12} /> Stay consistent to unlock all legendary rewards!
                 </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER TIPS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 py-8 opacity-50 border-t border-[var(--border-subtle)]">
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
           <Gift size={14} className="text-orange-500" /> Milestone 7 Hit: +10 Coins
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
           <Gift size={14} className="text-orange-500" /> Next Big Win: Day {nextMilestone.day}
         </div>
      </div>
    </div>
  );
};

export default StreakDetail;
