"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Mic, 
  Zap, 
  Target, 
  Trophy, 
  ChevronDown,
  PlayCircle,
  Apple
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareSummaryCardProps {
  user: {
    name: string;
    email?: string;
    photoURL?: string;
    streakCount?: number;
    initial?: string;
    isPro?: boolean;
  };

  stats: {
    totalInterviews: number;
    averageScore: number;
    badgeCount: number;
  };
  className?: string;
}

const ShareSummaryCard = ({ user, stats, className }: ShareSummaryCardProps) => {
  const handle = `@${user.name.toLowerCase().replace(/\s+/g, "") || user.email?.split("@")[0] || "user"}`;

  const cards = [
    {
      label: "INTERVIEWS",
      value: stats.totalInterviews,
      icon: <Mic className="w-6 h-6 text-yellow-400" />,
      color: "border-yellow-500/20 bg-yellow-500/5",
      iconBg: "bg-yellow-500/10",
      textColor: "text-yellow-400"
    },
    {
      label: "STREAKS",
      value: user.streakCount || 0,
      icon: <Zap className="w-6 h-6 text-pink-500" />,
      color: "border-pink-500/20 bg-pink-500/5",
      iconBg: "bg-pink-500/10",
      textColor: "text-pink-500"
    },
    {
      label: "ACCURACY",
      value: `${stats.averageScore}%`,
      icon: <Target className="w-6 h-6 text-blue-500" />,
      color: "border-blue-500/20 bg-blue-500/5",
      iconBg: "bg-blue-500/10",
      textColor: "text-blue-500"
    },
    {
      label: "BADGES",
      value: stats.badgeCount,
      icon: <Trophy className="w-6 h-6 text-green-500" />,
      color: "border-green-500/20 bg-green-500/5",
      iconBg: "bg-green-500/10",
      textColor: "text-green-500"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative w-full max-w-sm mx-auto bg-[#0A0A0A] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden text-white font-sans",
        className
      )}
    >
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#ffffff_1px,_transparent_1px)] bg-[length:24px_24px]" />
      </div>

      {/* Header Chevron */}
      <div className="flex justify-end mb-2">
        <ChevronDown className="w-6 h-6 text-white/40" />
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-2 gap-4 relative">
        {cards.map((card, idx) => (
          <div
            key={card.label}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all duration-300 hover:scale-[1.02]",
              card.color
            )}
          >
            <div className={cn("p-3 rounded-2xl mb-3", card.iconBg)}>
              {card.icon}
            </div>
            <span className="text-3xl font-black tracking-tight mb-1">{card.value}</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              {card.label}
            </span>
          </div>
        ))}

        {/* Central Avatar Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative group">
            {/* Glowing Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-green-500 rounded-full opacity-70 blur-[2px]" 
            />
            
            {/* Avatar Container */}
            <div className="relative h-20 w-20 rounded-full bg-[#0A0A0A] border-[3px] border-[#0A0A0A] overflow-hidden flex items-center justify-center">

              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-white/80">{user.initial || "U"}</span>
              )}
            </div>

            {/* Level/Status Badge */}
            {user.isPro && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#4DA1A9] border-2 border-[#0A0A0A] text-[10px] font-black text-[#0A0A0A] shadow-lg">
                PRO
              </div>
            )}
          </div>

        </div>
      </div>

      {/* User Info Section */}
      <div className="mt-12 space-y-1">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-none">
            {user.name}
          </h3>
          {user.isPro && (
            <span className="px-2 py-0.5 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-md text-[8px] font-black text-white uppercase tracking-wider">
              PRO
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-white/30 tracking-wide uppercase">
          {handle}
        </p>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform">
            <Zap className="w-3.5 h-3.5 text-black -rotate-45 group-hover:rotate-0 transition-transform" />
          </div>
          <span className="text-sm font-black tracking-[0.2em] uppercase text-white/80">
            Prep<span className="text-green-500">Edge</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <PlayCircle className="w-5 h-5 text-white/60" />
          </div>
          <div className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <Apple className="w-5 h-5 text-white/60" />
          </div>
        </div>
      </div>


    </motion.div>
  );
};

export default ShareSummaryCard;
