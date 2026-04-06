"use client";

import { useState, useEffect } from "react";
import { Star, Send, Rocket, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { submitReview } from "@/lib/actions/general.action";
import { toast } from "sonner";
import NumberCounter from "@/components/NumberCounter";

interface UserReviewProps {
  userId: string;
  username: string;
  totalUsers: number;
}

export default function UserReview({ userId, username, totalUsers }: UserReviewProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating!");
      return;
    }
    if (!message.trim()) {
      toast.error("Please write a short review!");
      return;
    }

    setLoading(true);
    try {
      const res = await submitReview({
        userId,
        rating,
        message,
        username,
      });

      if (res.success) {
        setSubmitted(true);
        toast.success("Thank you for your feedback!");
      } else {
        toast.error("Failed to submit review. Try again!");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 border-t border-[var(--border-subtle)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto text-center py-10 rounded-[3rem] bg-[var(--surface-card-alt)] border border-[var(--border-subtle)] backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Review Submitted!</h2>
          <p className="text-[var(--text-secondary)] mb-8">Thank you for helping us build the future of interview prep.</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <Star className="w-4 h-4 fill-blue-400" />
            Joined <NumberCounter value={totalUsers} /> successful users
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 relative overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--surface-primary)]">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row gap-12 items-center">
        
        {/* Stats Column */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
          className="flex-1 bg-[var(--surface-card-alt)] border border-[var(--border-subtle)] p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-wider mb-8">
            <Users className="w-4 h-4" />
            Global Community
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-6 leading-[1.1]">
            Loved by <span className="text-blue-500 inline-block tracking-tighter"><NumberCounter value={totalUsers} />+</span> users worldwide
          </h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-10 max-w-md font-medium">
            Join thousands of ambitious candidates who have already unlocked their potential with PrepEdge.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Animated Avatars */}
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    delay: i * 0.4,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 789 + 123}`} 
                    alt="User" 
                    className="w-12 h-12 rounded-2xl border-4 border-[var(--bg-primary)] shadow-xl group-hover:border-blue-500/30 transition-colors"
                  />
                </motion.div>
              ))}
            </div>
            
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="flex text-yellow-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                ))}
              </div>
              <span className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Highly Rated Platform</span>
            </div>
          </div>
        </motion.div>

        {/* Review Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -5, scale: 1.01 }}
          className="w-full md:w-[480px] bg-[var(--surface-card)] border border-[var(--border-subtle)] p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden transition-all duration-500"
        >
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Rate Your Experience</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-8 font-medium">Your feedback helps us build the future of interview prep.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stars */}
            <div className="flex justify-center gap-3 py-4 bg-white/5 rounded-[2rem] border border-white/5">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.3, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-all ${
                      (hover || rating) >= star
                        ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                        : "text-[var(--text-secondary)] opacity-10"
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            <div className="space-y-3">
              <label htmlFor="review" className="text-sm font-bold text-[var(--text-secondary)] ml-2 uppercase tracking-wide">Share your thoughts</label>
              <textarea
                id="review"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you loved about PrepEdge..."
                className="w-full bg-[var(--search-bg)] border border-[var(--border-subtle)] rounded-3xl p-5 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[140px] transition-all placeholder:text-[var(--text-secondary)]/30 resize-none font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !userId}
              className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.75rem] font-bold text-xl shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <span className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Review
                </>
              )}
            </Button>
            {!userId && (
              <p className="text-center text-xs text-red-400/90 mt-4 font-bold uppercase tracking-wider">Sign in required to submit</p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
