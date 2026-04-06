"use client";

import { Check, Zap, Star, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

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

  const handleUpgrade = async () => {
    setLoading(true);
    // This is where Stripe Checkout would be triggered
    // For now, we simulate success for demonstration
    setTimeout(() => {
      toast.success("Redirecting to secure checkout...");
      setLoading(false);
      // In a real app: router.push(stripeCheckoutUrl)
    }, 1500);
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
                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">{tier.price}</span>
                  {tier.period && <span className="text-[var(--text-secondary)] font-bold">{tier.period}</span>}
                </div>
                <p className="text-[var(--text-secondary)] text-sm mt-4 leading-relaxed font-medium">
                  {tier.description}
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text-secondary)]">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={tier.highlight ? handleUpgrade : undefined}
                disabled={loading && tier.highlight}
                className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  tier.highlight 
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20" 
                    : "bg-white/5 hover:bg-white/10 text-[var(--text-primary)] border border-white/5"
                }`}
              >
                {loading && tier.highlight ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  tier.buttonText
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
