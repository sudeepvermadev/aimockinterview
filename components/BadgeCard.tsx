"use client";

import { Flame, Crown, Gem, BookOpen, Medal, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  Flame,
  Crown,
  Gem,
  BookOpen,
  Medal
};

const COLOR_MAP = {
  orange: "text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/20",
  yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-yellow-500/20",
  blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/20",
  emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/20",
  purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/20",
};

interface BadgeCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

const BadgeCard = ({ name, description, icon, color, unlocked }: BadgeCardProps) => {
  const IconComponent = ICON_MAP[icon as keyof typeof ICON_MAP] || Medal;
  const colorClasses = COLOR_MAP[color as keyof typeof COLOR_MAP] || COLOR_MAP.blue;

  return (
    <div 
      className={cn(
        "group relative flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-500 overflow-hidden",
        unlocked 
          ? "bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-white/20 shadow-lg hover:shadow-2xl" 
          : "bg-white/[0.02] border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
      )}
    >
      {/* Background Decor */}
      {unlocked && (
        <div className={cn(
            "absolute -top-12 -right-12 w-24 h-24 blur-[40px] opacity-20 transition-all duration-500 group-hover:scale-150 rotate-45",
            `bg-gradient-to-br from-${color}-500 to-transparent`
        )} />
      )}

      {/* Icon Container */}
      <div className={cn(
        "relative p-4 rounded-2xl border transition-all duration-500 mb-4",
        unlocked 
          ? colorClasses 
          : "bg-white/5 border-white/10 text-gray-400"
      )}>
        <IconComponent size={28} className={cn("transition-transform duration-500", unlocked && "group-hover:scale-125")} />
        
        {!unlocked && (
          <div className="absolute -bottom-1 -right-1 p-1 bg-[#0e0f15] rounded-full border border-white/10">
            <Lock size={10} className="text-gray-500" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className={cn(
          "font-extrabold text-sm tracking-tight mb-1 transition-colors duration-300",
          unlocked ? "text-[var(--text-primary)]" : "text-gray-500"
        )}>
          {name}
        </h3>
        <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
          {description}
        </p>
      </div>

      {/* Unlocked Glow Effect */}
      {unlocked && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
};

export default BadgeCard;
