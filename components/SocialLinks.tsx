"use client";

import { Instagram, Send, MessageCircle, Share2, Linkedin, Github, X, Twitter, Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const socialLinks = [
  {
    name: "Instagram",
    icon: <Instagram className="w-6 h-6" />,
    href: "https://www.instagram.com/_sudeepver/",
    color: "bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]",
    shadow: "shadow-[0_0_15px_rgba(220,39,67,0.4)]"
  },
  {
    name: "WhatsApp",
    icon: <MessageCircle className="w-6 h-6" />,
    href: "https://wa.me/prepedge",
    color: "bg-[#25D366]",
    shadow: "shadow-[0_0_15px_rgba(37,211,102,0.4)]"
  },
  {
    name: "Telegram",
    icon: <Send className="w-6 h-6" />,
    href: "https://t.me/prepedge",
    color: "bg-[#0088cc]",
    shadow: "shadow-[0_0_15px_rgba(0,136,204,0.4)]"
  },
  {
    name: "LinkedIn",
    icon: <Linkedin className="w-6 h-6" />,
    href: "https://in.linkedin.com/in/sudeep9111",
    color: "bg-[#0077b5]",
    shadow: "shadow-[0_0_15px_rgba(0,119,181,0.4)]"
  },
  {
    name: "GitHub",
    icon: <Github className="w-6 h-6" />,
    href: "https://github.com/sudeep9111",
    color: "bg-[#24292e]",
    shadow: "shadow-[0_0_15px_rgba(36,41,46,0.4)]"
  }
];

export default function SocialLinks() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const shareUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://prepedge.com";
  const shareText = "Check out PrepEdge! 🚀 The best AI-powered mock interview platform to build your confidence and ace your next job interview.";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  const shareOptions = [
    { 
      name: "WhatsApp", 
      icon: <MessageCircle className="w-5 h-5" />, 
      link: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, 
      color: "bg-[#25D366]" 
    },
    { 
      name: "LinkedIn", 
      icon: <Linkedin className="w-5 h-5" />, 
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, 
      color: "bg-[#0077b5]" 
    },
    { 
      name: "Twitter", 
      icon: <Twitter className="w-5 h-5" />, 
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, 
      color: "bg-black" 
    },
    { 
      name: "Telegram", 
      icon: <Send className="w-5 h-5" />, 
      link: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, 
      color: "bg-[#0088cc]" 
    },
    { 
      name: "Copy", 
      icon: <Copy className="w-5 h-5" />, 
      link: "#", 
      color: "bg-slate-700", 
      action: copyToClipboard 
    },
  ];

  return (
    <section className="py-20 px-6 border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(45deg, #4f46e5 25%, transparent 25%), linear-gradient(-45deg, #4f46e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4f46e5 75%), linear-gradient(-45deg, transparent 75%, #4f46e5 75%)", backgroundSize: "40px 40px" }} />
      
      <div className="w-full max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
          Stay Connected
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
          Follow Us on <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Social Media</span>
        </h2>
        <p className="text-[var(--text-secondary)] text-lg mb-12 max-w-lg mx-auto">
          Get the latest updates, interview tips, and community highlights delivered to your favorite platforms.
        </p>

        <div className="flex flex-wrap justify-center gap-8">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-4 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`${social.color} p-5 rounded-[1.75rem] text-white ${social.shadow} transition-all duration-300 group-hover:scale-110 group-active:scale-95`}>
                {social.icon}
              </div>
              <span className="text-sm font-bold text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)]">
                {social.name}
              </span>
            </a>
          ))}
        </div>

        {/* Invite/Share CTA */}
        <div className="mt-20 p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-6 max-w-2xl mx-auto backdrop-blur-sm">
          <div className="text-left">
            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-1">Help others grow</h4>
            <p className="text-[var(--text-secondary)] text-sm">Share PrepEdge with your friends and colleagues.</p>
          </div>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--search-bg)] hover:bg-[var(--dropdown-item-hover)] border border-[var(--border-subtle)] rounded-2xl text-[var(--text-primary)] font-bold transition-all hover:scale-105 active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-[var(--surface-card)] dark:bg-[#0e0f15] border-2 border-[var(--border-primary)] rounded-[3rem] p-8 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.4)] z-[9999]"
              style={{ backgroundColor: 'var(--surface-card)' }}
            >
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-6 right-6 p-2.5 hover:bg-[var(--surface-base)] rounded-2xl transition-all border border-[var(--border-subtle)]"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                  <Share2 className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Spread the Word</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium italic">Help your peers ace their next interview</p>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-8">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (option.action) {
                        e.preventDefault();
                        option.action();
                      }
                    }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`${option.color} p-3 rounded-2xl text-white shadow-lg transition-all group-hover:scale-110 group-active:scale-95 group-hover:-translate-y-1`}>
                      {option.icon}
                    </div>
                    <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">{option.name}</span>
                  </a>
                ))}
              </div>

              <div className="p-4 bg-[var(--surface-base)] rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <p className="text-[10px] text-[var(--text-secondary)] font-medium truncate flex-1">{shareUrl}</p>
                <button 
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-lg hover:bg-blue-500/20 transition-all uppercase tracking-wider"
                >
                  Copy Link
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
