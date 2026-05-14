"use client";

import { Flame, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StreakBadgeProps {
  streak: number;
}

const StreakBadge = ({ streak }: StreakBadgeProps) => {
  if (streak === undefined || streak === null) return null;

  return (
    <div className="relative">
      <Link 
        href="/streak"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 border group",
          "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15 hover:border-orange-500/40 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]"
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
        </span>
      </Link>
    </div>
  );
};

export default StreakBadge;
