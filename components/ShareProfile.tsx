"use client";

import React, { useState } from "react";
import { 
  Share2, 
  X, 
  Copy, 
  Check,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  Instagram,
  LucideIcon
} from "lucide-react";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ShareSummaryCard from "./ShareSummaryCard";



interface ShareProfileProps {
  user: {
    name: string;
    email?: string;
    photoURL?: string;
    streakCount?: number;
    initial?: string;
  };
  stats: {
    totalInterviews: number;
    averageScore: number;
    badgeCount: number;
  };
}

const ShareProfile = ({ user, stats }: ShareProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const displayName = user.name || "Candidate";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://prepedge.ai";
  const shareText = `Check out my interview performance on PrepEdge! 🚀`;

  const shareOptions: { name: string; icon: LucideIcon; color: string; link: string }[] = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366]",
      link: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0077B5]",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      color: "bg-[#000000]",
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#0088CC]",
      link: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
      link: `https://www.instagram.com/`, 
    }
  ];


  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 group hover:bg-blue-500/20"
      >
        <Share2 className="w-3 h-3 group-hover:rotate-12 transition-transform" />
        Share
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg bg-[var(--surface-card)] dark:bg-[#0e0f15] border-2 border-[var(--border-primary)] rounded-[3rem] p-6 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.4)] z-[9999] overflow-y-auto max-h-[90vh] custom-scrollbar"
              style={{ backgroundColor: 'var(--surface-card)' }}
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2.5 hover:bg-[var(--surface-base)] rounded-2xl transition-all z-[10000] border border-[var(--border-subtle)]"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Share Your Edge</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium italic">Spread the word about your achievements</p>
              </div>

              <div className="flex justify-center mb-6">
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                >
                  {showPreview ? "Hide Card Preview" : "Show Card Preview"}
                </button>
              </div>

              {showPreview && (
                <div className="mb-8 flex justify-center">
                   <div className="scale-90 md:scale-100 origin-top">
                     <ShareSummaryCard user={user} stats={stats} />
                   </div>
                </div>
              )}

              <div className="grid grid-cols-5 gap-3 mb-8">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform",
                      option.color
                    )}>
                      <option.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{option.name.split(' ')[0]}</span>
                  </a>
                ))}
              </div>


              <div className="relative">
                <div className="flex items-center gap-2 p-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl}
                    className="flex-1 bg-transparent border-none text-xs text-[var(--text-secondary)] px-3 outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center">
                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em]">PrepEdge Neural Network</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


export default ShareProfile;

