"use client";

import { Flame, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface StreakBadgeProps {
  streak: number;
  history?: { date: string; day: string; isActive: boolean }[];
}

const StreakBadge = ({ streak, history = [] }: StreakBadgeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (streak === undefined || streak === null) return null;

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 border group",
          isOpen 
            ? "bg-orange-500/20 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)]" 
            : "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15"
        )}
      >
        <div className="relative">
          <Flame 
            size={18} 
            className={cn(
              "text-orange-500 transition-transform duration-300 group-hover:scale-110",
              streak > 0 && "animate-pulse"
            )} 
            fill={streak > 0 ? "currentColor" : "none"}
          />
          {streak > 0 && (
            <span className="absolute inset-0 blur-sm bg-orange-500/40 rounded-full animate-pulse -z-10" />
          )}
        </div>
        <span className="dark:text-orange-100 text-black font-bold text-sm tracking-tight flex items-center gap-1">
          {streak} 
          <span className="hidden lg:inline opacity-80 font-medium">Day Streak</span>
          <ChevronDown size={14} className={cn("opacity-50 transition-transform duration-300", isOpen && "rotate-180")} />
        </span>
      </button>

      {/* STREAK HISTORY POPOVER */}
      {isOpen && (
        <div className="absolute top-full mt-3 right-0 w-64 p-5 dark:bg-[#0e0f15] bg-white border border-orange-500/30 rounded-2xl shadow-2xl z-[100] animate-fadeIn">
          <div className="flex flex-col gap-4">
            <header className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-orange-100/50 text-orange-600/50">Activity Log</span>
              <span className="text-[10px] font-bold dark:text-white text-black">{streak} Day Fire</span>
            </header>

            <div className="flex justify-between items-end h-16 px-1">
              {history.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group/day">
                  {/* Day marker (Dot/Square) */}
                  <div 
                    className={cn(
                      "w-4 h-4 rounded-md transition-all duration-500",
                      day.isActive 
                        ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] scale-110" 
                        : "dark:bg-white/5 bg-gray-100 border border-white/5"
                    )}
                  />
                  {/* Day Label */}
                  <span className={cn(
                    "text-[10px] font-bold",
                    day.isActive ? "dark:text-orange-400 text-orange-600" : "text-muted-foreground"
                  )}>
                    {day.day}
                  </span>
                  
                  {/* Activity Tooltip */}
                  <div className="absolute bottom-full mb-8 opacity-0 group-hover/day:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black text-white text-[8px] px-2 py-1 rounded whitespace-nowrap shadow-xl">
                      {day.isActive ? "Active" : "No Session"} - {day.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] dark:text-slate-500 text-slate-400 leading-relaxed italic text-center px-2">
              Keep practicing every day to maintain your streak!
            </p>
          </div>
          
          {/* Popover Arrow */}
          <div className="absolute -top-1 right-6 w-2 h-2 bg-inherit border-t border-l border-orange-500/30 rotate-45" />
        </div>
      )}
    </div>
  );
};

export default StreakBadge;
