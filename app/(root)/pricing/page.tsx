"use client";

import { Check, Zap, Star, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import SimulatedPaymentModal from "@/components/SimulatedPaymentModal";
import { auth } from "@/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";
import { updateUserPlan } from "@/lib/actions/auth.action";
import { Sparkles, Trophy, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for a quick practice session before your interview.",
    features: [
      "3 Mock Interviews per month",
      "Basic AI Feedback",
      "Transcript Storage",
      "Community Access",
    ],
    buttonText: "Current Plan",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Unlimited power for serious job hunters and career switchers.",
    features: [
      "Unlimited Mock Interviews",
      "Detailed Skill Analysis",
      "Public Sharing & Profiles",
      "PDF Report Downloads",
      "Resume-Based Questions",
      "Priority AI Processing",
    ],
    buttonText: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Scalable interview prep for universities and bootcamps.",
    features: [
      "Bulk User Management",
      "Custom Interview Templates",
      "API Access",
      "Dedicated Support",
      "Whitelabeling Options",
    ],
    buttonText: "Contact Sales",
    highlight: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: "", price: "" });
  const [showCelebration, setShowCelebration] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch extended user data from Firestore
        const { getDoc, doc } = await import("firebase/firestore");
        const { db } = await import("@/firebase/client");
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...currentUser, ...userDoc.data() });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  const handleUpgrade = async (plan: any) => {
    if (!user) {
      toast.error("Please sign in to upgrade your plan.");
      return;
    }
    setSelectedPlan({ name: plan.name, price: plan.price + (plan.period || "") });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await updateUserPlan(user.uid, "Pro");
      if (result.success) {
        setIsPaymentModalOpen(false);
        setShowCelebration(true);
        
        // Refresh page after celebration to reflect Pro status globally
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      } else {
        toast.error("Something went wrong. Please try again.");
      }

    } catch (error) {
      toast.error("Failed to update plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-base)] pb-24 pt-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-[92%] max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            Simple Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight">
            Invest in your <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Future Self</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg md:text-xl font-medium">
            Join 10,000+ candidates using PrepEdge to land their dream jobs at top-tier companies.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`relative p-10 rounded-[3rem] border transition-all duration-500 hover:-translate-y-2 ${
                tier.highlight 
                  ? "bg-slate-900 border-blue-500/50 shadow-[0_0_40px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/20" 
                  : "bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-white/20"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-2xl font-black mb-2 ${tier.highlight ? "text-white" : "text-[var(--text-primary)]"}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-black tracking-tighter ${tier.highlight ? "text-white" : "text-[var(--text-primary)]"}`}>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className={`font-bold ${tier.highlight ? "text-white/60" : "text-[var(--text-secondary)]"}`}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-4 leading-relaxed font-medium ${tier.highlight ? "text-white/70" : "text-[var(--text-secondary)]"}`}>
                  {tier.description}
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className={`text-sm font-bold ${tier.highlight ? "text-white/80" : "text-[var(--text-secondary)]"}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={tier.highlight ? () => handleUpgrade(tier) : undefined}
                disabled={(loading && tier.highlight) || (tier.name === (user?.isPro ? "Pro" : "Free"))}
                className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  tier.highlight 
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20" 
                    : "bg-white/5 hover:bg-white/10 text-[var(--text-primary)] border border-white/5"
                }`}
              >
                {loading && tier.highlight ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                   (user?.isPro && tier.name === "Pro") || (!user?.isPro && tier.name === "Free") ? "Current Plan" : tier.buttonText
                )}
              </Button>

            </div>
          ))}
        </div>

        {/* Bottom Trust Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 pt-20 border-t border-[var(--border-subtle)]">
          <TrustItem 
            icon={<Shield className="w-6 h-6 text-blue-400" />} 
            title="Secure Payments" 
            desc="Encryption handled by Stripe. We never store your card details."
          />
          <TrustItem 
            icon={<Star className="w-6 h-6 text-yellow-400" />} 
            title="Money-Back Guarantee" 
            desc="If you don't love your Pro experience, we'll refund you within 7 days."
          />
          <TrustItem 
            icon={<Rocket className="w-6 h-6 text-purple-400" />} 
            title="Instant Activation" 
            desc="Upgrade once and get instant access to all premium features."
          />
        </div>

      </div>

      <SimulatedPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        planName={selectedPlan.name}
        amount={selectedPlan.price}
      />

      {/* CELEBRATION OVERLAY */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] flex items-center justify-center bg-blue-600/10 backdrop-blur-xl"
          >
             {/* Floating Sparkles */}
             {[...Array(20)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ 
                   x: 0, 
                   y: 0, 
                   opacity: 1,
                   scale: 0 
                 }}
                 animate={{ 
                   x: (Math.random() - 0.5) * 1000, 
                   y: (Math.random() - 0.5) * 1000, 
                   opacity: 0,
                   scale: Math.random() * 2,
                   rotate: Math.random() * 360
                 }}
                 transition={{ duration: 3, ease: "easeOut" }}
                 className="absolute"
               >
                 <Sparkles className={`w-${Math.floor(Math.random() * 6) + 4} h-${Math.floor(Math.random() * 6) + 4} text-yellow-400 fill-yellow-400`} />
               </motion.div>
             ))}

             <motion.div 
               initial={{ scale: 0.5, opacity: 0, y: 50 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               className="text-center space-y-8 p-12 rounded-[4rem] bg-white shadow-2xl relative"
             >
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl">
                    <Trophy className="w-16 h-16 text-white" />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                  >
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tight">You&apos;re a Pro!</h2>
                  <p className="text-xl text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                    Welcome to the elite club of job hunters. Your premium features are now active.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 py-3 px-6 bg-blue-50 rounded-2xl border border-blue-100 mx-auto w-fit">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                   <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Activating Membership...</span>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



function TrustItem({ icon, title, desc }: any) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="p-4 bg-white/5 rounded-2xl">
        {icon}
      </div>
      <h4 className="text-lg font-bold text-[var(--text-primary)]">{title}</h4>
      <p className="text-sm text-[var(--text-secondary)] font-medium max-w-[250px]">{desc}</p>
    </div>
  );
}
