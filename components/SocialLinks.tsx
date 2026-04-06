"use client";

import { Instagram, Send, MessageCircle, Share2, Linkedin, Github } from "lucide-react";
import { toast } from "sonner";

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
  const shareUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://prepedge.com";

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

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
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--search-bg)] hover:bg-[var(--dropdown-item-hover)] border border-[var(--border-subtle)] rounded-2xl text-[var(--text-primary)] font-bold transition-all hover:scale-105 active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
        </div>
      </div>
    </section>
  );
}
