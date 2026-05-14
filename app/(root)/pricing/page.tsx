"use client";

import { Check, Zap, Star, Shield, Rocket, Coins, Plus, Wallet, Sparkles, Trophy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import SimulatedPaymentModal from "@/components/SimulatedPaymentModal";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { rechargeWallet, purchaseSubscription } from "@/lib/actions/payment.action";
import { motion, AnimatePresence } from "framer-motion";

const tiers = [
  {
    name: "Free",
    id: "free",
    price: "₹0",
    numericPrice: 0,
    description: "Perfect for a quick practice session before your interview.",
    features: [
      "200 PrepCoins for practice",
      "50 Coins per Interview",
      "Basic AI Feedback",
      "Transcript Storage",
      "Community Access",
    ],
    buttonText: "Basic Access",
    highlight: false,
    btnType: "current"
  },
  {
    name: "Weekly Pro",
    id: "weekly",
    price: "₹199",
    numericPrice: 199,
    period: "/week",
    description: "Short-term boost for an upcoming interview.",
    features: [
      "Unlimited Mock Interviews",
      "Detailed Skill Analysis",
      "PDF Report Downloads",
      "Priority AI Processing",
    ],
    buttonText: "Get Started",
    highlight: false,
    btnType: "primary"
  },
  {
    name: "Monthly Pro",
    id: "monthly",
    price: "₹499",
    numericPrice: 499,
    period: "/month",
    description: "Unlimited power for serious job hunters.",
    features: [
      "Everything in Weekly",
      "Resume-Based Questions",
      "Public Sharing & Profiles",
      "Advanced Analytics",
    ],
    buttonText: "Upgrade Now",
    highlight: true,
    btnType: "popular"
  },
  {
    name: "Yearly Pro",
    id: "yearly",
    price: "₹4,999",
    numericPrice: 4999,
    period: "/year",
    description: "Best for long-term career growth and skill building.",
    features: [
      "Everything in Monthly",
      "Dedicated Support",
      "Early Access to Features",
      "2 Months Free Included",
    ],
    buttonText: "Save Big",
    highlight: false,
    btnType: "yearly"
  },
];

const RECHARGE_OPTIONS = [
  { inr: 100, coins: 1000, label: "Basic" },
  { inr: 500, coins: 5500, label: "Popular", bonus: "500 Bonus" },
  { inr: 1000, coins: 12000, label: "Best Value", bonus: "2000 Bonus" },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ name: "", price: "", numericPrice: 0, type: "subscription" as "subscription" | "recharge", planId: "" });
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState<"plans" | "recharge">("plans");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
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

  const handleUpgrade = (plan: any) => {
    if (!user) {
      toast.error("Please sign in to upgrade your plan.");
      return;
    }
    setPaymentData({ 
      name: plan.name, 
      price: plan.price + (plan.period || ""), 
      numericPrice: plan.numericPrice,
      type: "subscription",
      planId: plan.id || "pro"
    });
    setIsPaymentModalOpen(true);
  };

  const handleRecharge = (option: any) => {
    if (!user) {
      toast.error("Please sign in to recharge your wallet.");
      return;
    }
    setPaymentData({ 
      name: `${option.coins} PrepCoins`, 
      price: `₹${option.inr}`, 
      numericPrice: option.inr,
      type: "recharge",
      planId: ""
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (data: { method: string; transactionId: string }) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let result;
      if (paymentData.type === "subscription") {
        result = await purchaseSubscription(user.uid, paymentData.planId as any, paymentData.numericPrice, data.method);
      } else {
        result = await rechargeWallet(user.uid, paymentData.numericPrice, data.method);
      }

      if (result.success) {
        setIsPaymentModalOpen(false);
        setShowCelebration(true);
        toast.success(result.message);
        
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      } else {
        toast.error(result.message || "Something went wrong.");
      }

    } catch (error) {
      toast.error("Failed to process transaction.");
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
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            Pricing & Wallet
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight">
            Invest in your <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Future Self</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-16">
          <div className="p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex gap-2">
            <button 
              onClick={() => setActiveTab("plans")}
              className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === "plans" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              Subscription Plans
            </button>
            <button 
              onClick={() => setActiveTab("recharge")}
              className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === "recharge" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              Recharge Wallet
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "plans" ? (
            <motion.div 
              key="plans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
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
                    onClick={tier.numericPrice > 0 ? () => handleUpgrade(tier) : undefined}
                    disabled={(loading && tier.highlight) || (user?.plan === tier.id) || (tier.id === "free" && !user?.isPro)}
                    className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                      tier.btnType === "popular" 
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20" 
                        : tier.btnType === "primary"
                        ? "bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30"
                        : tier.btnType === "yearly"
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20"
                        : "bg-white/5 text-[var(--text-secondary)] cursor-default border border-white/5"
                    }`}
                  >
                    {loading && tier.highlight ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                       (user?.plan === tier.id) || (tier.id === "free" && !user?.isPro) ? (
                         <div className="flex items-center gap-2">
                           <CheckCircle2 className="w-4 h-4" />
                           Current Plan
                         </div>
                       ) : (user?.isPro && tier.id === "free") ? "Included" : tier.buttonText
                    )}
                  </Button>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="recharge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[3.5rem] p-12 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                 
                 <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="space-y-6 flex-1">
                       <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <Coins className="w-8 h-8 text-blue-400" />
                       </div>
                       <div>
                          <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2">Recharge PrepCoins</h2>
                          <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
                             Use PrepCoins to unlock premium mock interviews, detailed skill reports, and priority AI processing. 1 PrepCoin = ₹0.1.
                          </p>
                       </div>
                       
                       <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-blue-400" />
                             </div>
                             <div>
                                <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Your Balance</p>
                                <p className="text-xl font-black text-[var(--text-primary)]">{user?.walletBalance || 0} PrepCoins</p>
                             </div>
                          </div>
                          <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 w-full md:w-80">
                       {RECHARGE_OPTIONS.map((option) => (
                          <button 
                            key={option.inr}
                            onClick={() => handleRecharge(option)}
                            className="group relative p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left overflow-hidden"
                          >
                             {option.bonus && (
                                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                                   {option.bonus}
                                </div>
                             )}
                             <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{option.label}</p>
                             <div className="flex items-end justify-between">
                                <div>
                                   <p className="text-2xl font-black text-[var(--text-primary)]">{option.coins} <span className="text-xs text-[var(--text-secondary)]">Coins</span></p>
                                   <p className="text-sm font-bold text-[var(--text-secondary)]">Pay ₹{option.inr}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                   <Plus className="w-5 h-5" />
                                </div>
                             </div>
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Trust Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 pt-20 border-t border-[var(--border-subtle)]">
          <TrustItem 
            icon={<Shield className="w-6 h-6 text-blue-400" />} 
            title="Secure Payments" 
            desc="PCI-DSS compliant processing. We never store your card details."
          />
          <TrustItem 
            icon={<Star className="w-6 h-6 text-yellow-400" />} 
            title="Money-Back Guarantee" 
            desc="If you don't love your experience, we'll refund you within 7 days."
          />
          <TrustItem 
            icon={<Rocket className="w-6 h-6 text-purple-400" />} 
            title="Instant Activation" 
            desc="Recharge once and get instant access to all premium features."
          />
        </div>

      </div>

      <SimulatedPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        planName={paymentData.name}
        amount={paymentData.price}
        numericAmount={paymentData.numericPrice}
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
                 initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
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
                  <h2 className="text-5xl font-black text-slate-900 tracking-tight">Success!</h2>
                  <p className="text-xl text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                    {paymentData.type === "subscription" 
                      ? "You're now a Pro member! Your premium features are active." 
                      : "PrepCoins added to your wallet successfully!"}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 py-3 px-6 bg-blue-50 rounded-2xl border border-blue-100 mx-auto w-fit">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                   <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Updating Account...</span>
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
