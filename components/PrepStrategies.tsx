"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  Star, 
  MessageSquare, 
  Mic, 
  Monitor, 
  Users,
  ChevronRight,
  Lightbulb,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * STRATEGY ITEM INTERFACE
 * Ensures strict TypeScript compliance to eliminate editor warnings.
 */
interface StrategyDetail {
  label: string;
  desc: string;
}

interface StrategyItem {
  id: number;
  title: string;
  icon: React.ReactNode;
  content: string;
  color: string;      // Accent text color (e.g., text-blue-500)
  glowColor: string;   // Radial glow color (hex or rgba)
  auraColor: string;   // Icon halo color
  benefits?: string[];
  details?: StrategyDetail[];
  questions?: string[];
  avoid?: string;
  structure?: StrategyDetail[];
  advice?: string;
  checklist?: StrategyDetail[];
  bonusTip?: string;
  proTip?: string;     // Added missing property
  stories?: string[];
  practice?: string;
  example?: string;
}

export default function PrepStrategies() {
  const [mounted, setMounted] = useState(false);

  // HYDRATION GUARD
  useEffect(() => {
    setMounted(true);
  }, []);

  // STRATEGY DATA
  const strategyData = useMemo<StrategyItem[]>(() => [
    {
      id: 1,
      title: "Research Thoroughly",
      icon: <Building2 className="w-5 h-5" />,
      color: "text-blue-500",
      glowColor: "rgba(59, 130, 246, 0.15)",
      auraColor: "bg-blue-500/20",
      content: "Invest 2-3 hours researching the company's mission, values, and culture via LinkedIn and recent news.",
      benefits: [
        "Align with company values",
        "Ask intelligent questions",
        "Demonstrate genuine interest",
        "Connect skills to challenges"
      ],
      proTip: "Prepare 3 specific reasons why you specifically want THIS role."
    },
    {
      id: 2,
      title: "Master STAR Method",
      icon: <Star className="w-5 h-5" />,
      color: "text-emerald-500",
      glowColor: "rgba(16, 185, 129, 0.15)",
      auraColor: "bg-emerald-500/20",
      content: "The gold standard for behavioral questions. Structure your answers to keep them focused and high-impact.",
      details: [
        { label: "S - Situation", desc: "Set the context briefly" },
        { label: "T - Task", desc: "What was the core challenge?" },
        { label: "A - Action", desc: "What specifically did YOU do?" },
        { label: "R - Result", desc: "Measurable, positive outcome" }
      ],
      example: '"I increased team productivity by 35%" is better than "I helped the team."'
    },
    {
      id: 3,
      title: "Insightful Questions",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "text-amber-500",
      glowColor: "rgba(245, 158, 11, 0.15)",
      auraColor: "bg-amber-500/20",
      content: "Have 5-7 questions ready to demonstrate your critical thinking and genuine interest in the role.",
      questions: [
        "What does success look like in 6 months?",
        "What are the team's biggest challenges?",
        "How is professional development supported?"
      ],
      avoid: "Avoid questions about benefits or salary in the earliest interview stages."
    },
    {
      id: 4,
      title: "The Perfect Elevator Pitch",
      icon: <Mic className="w-5 h-5" />,
      color: "text-rose-500",
      glowColor: "rgba(244, 63, 94, 0.15)",
      auraColor: "bg-rose-500/20",
      content: "A compelling 90-second introduction that effectively answers 'Tell me about yourself' and sets a professional tone.",
      structure: [
        { label: "Present", desc: "Current role & top 1-2 major achievements" },
        { label: "Past", desc: "Relevant experience & why it matters" },
        { label: "Future", desc: "Why you are excited for THIS specific role" },
        { label: "The Why", desc: "Briefly explain 'Why You' in one sentence" }
      ],
      advice: "Keep it conversational—aim for a dialogue, not a monologue. Record and time yourself.",
      bonusTip: "Always start with a 'Hook'—something unique that makes the interviewer pay immediate attention."
    },
    {
      id: 5,
      title: "Digital & Tech Presence",
      icon: <Monitor className="w-5 h-5" />,
      color: "text-indigo-500",
      glowColor: "rgba(99, 102, 241, 0.15)",
      auraColor: "bg-indigo-500/20",
      content: "Technical mastery in a virtual interview shows professionalism and attention to detail. Test 24h prior.",
      checklist: [
        { label: "Lighting", desc: "Face at a window or use a warm face light" },
        { label: "Background", desc: "Professional, clean, and distraction-free" },
        { label: "Tabs", desc: "Close all irrelevant tabs before sharing screen" },
        { label: "Audio", desc: "Use dedicated headphones for voice clarity" }
      ],
      practice: "Look directly into the camera lens, not the screen, to simulate natural eye contact.",
      advice: "Prepare a phone hotspot as a 60-second backup if your main Wi-Fi fails."
    },
    {
      id: 6,
      title: "Behavioral Mastery",
      icon: <Users className="w-5 h-5" />,
      color: "text-cyan-500",
      glowColor: "rgba(6, 182, 212, 0.15)",
      auraColor: "bg-cyan-500/20",
      content: "Prepare 5-7 stories demonstrating leadership, problem-solving, and conflict resolution skills.",
      stories: [
        "Handling difficult team members",
        "Taking initiative on a project",
        "Adapting to sudden changes",
        "Learning from professional failure"
      ],
      practice: "Stories should be versatile. Practice telling them concisely under 3 minutes."
    }
  ], []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.12, delayChildren: 0.2 } 
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 40, 
      scale: 0.9,
      filter: "blur(10px)"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        type: "spring" as const, 
        stiffness: 100, 
        damping: 15,
        duration: 0.8
      } 
    }
  };

  if (!mounted) return null;

  return (
    <section className="py-24 md:py-32 px-6 border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] relative overflow-hidden transition-colors duration-500">
      {/* Background Ambience Bloom */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/15 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full"
        />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 md:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <ArrowUpRight className="w-3.5 h-3.5" /> Mastery Curriculum
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-6">
            Essential <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Interview Preparation Strategies</span>
          </h2>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto font-medium leading-relaxed opacity-85">
            Six high-performance pillars to ensure unshakeable confidence throughout your interview journey.
          </p>
        </motion.div>

        {/* GRID WITH MESH-GLOW CARDS */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"
        >
          {strategyData.map((strategy) => (
            <motion.div 
              key={`strat-${strategy.id}`}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-6 transition-all duration-500 shadow-xl flex flex-col overflow-hidden backdrop-blur-md hover:backdrop-blur-xl hover:border-blue-500/30"
            >
              {/* Dynamic Radial Mesh Glow Overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top left, ${strategy.glowColor}, transparent 70%)`
                }}
              />

              {/* Header: Icon Cluster + Step Number */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="relative">
                  <div className={`absolute -inset-2 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${strategy.auraColor}`} />
                  <div className={`relative p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors ${strategy.color}`}>
                    {strategy.icon}
                  </div>
                </div>
                <div className={`text-5xl font-black opacity-100 transition-all duration-500 ${strategy.color}`}>
                  {String(strategy.id).padStart(2, '0')}
                </div>
              </div>

              {/* Title & Body */}
              <div className="space-y-4 mb-8 relative z-10">
                <h3 className={`text-2xl font-bold text-[var(--text-primary)] tracking-tight group-hover:${strategy.color.split(' ')[0]} transition-colors`}>
                  {strategy.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] leading-relaxed font-medium opacity-90 transition-colors">
                  {strategy.content}
                </p>
              </div>

              {/* Interaction Details */}
              <div className="space-y-4 flex-grow relative z-10">
                {strategy.benefits && (
                  <div className="space-y-2.5">
                    {strategy.benefits.map((benefit, i) => (
                      <div key={`${strategy.id}-b-${i}`} className="flex items-start gap-3 text-xs font-semibold text-[var(--text-primary)]">
                        <ChevronRight className={`w-4 h-4 mt-0.5 shrink-0 ${strategy.color}`} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {strategy.details && (
                  <div className="grid grid-cols-1 gap-3">
                    {strategy.details.map((detail, i) => (
                      <div key={`${strategy.id}-d-${i}`} className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-all">
                        <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1 ${strategy.color}`}>{detail.label}</p>
                        <p className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium leading-normal transition-colors">{detail.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {strategy.questions && (
                  <div className="space-y-2.5">
                    {strategy.questions.map((q, i) => (
                      <div key={`${strategy.id}-q-${i}`} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium italic border-l-2 border-l-amber-500/40 transition-colors">
                        &quot;{q}&quot;
                      </div>
                    ))}
                  </div>
                )}

                {strategy.structure && (
                  <div className="space-y-3">
                    {strategy.structure.map((item, i) => (
                      <div key={`${strategy.id}-s-${i}`} className="flex items-start gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 transition-colors">
                        <div className={`w-1 h-10 rounded-full ${strategy.color.replace('text', 'bg')}/40 shrink-0`} />
                        <div>
                          <p className="text-[10px] font-extrabold text-[var(--text-primary)] mb-1 uppercase tracking-tight">{item.label}</p>
                          <p className="text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium transition-colors">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {strategy.checklist && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {strategy.checklist.map((item, i) => (
                      <div key={`${strategy.id}-c-${i}`} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 transition-colors">
                         <span className={`text-[10px] font-bold uppercase ${strategy.color}`}>{item.label}</span>
                         <span className="text-[10px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-semibold transition-colors">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                )}

                {strategy.stories && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {strategy.stories.map((story, i) => (
                      <div key={`${strategy.id}-st-${i}`} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-semibold text-[var(--text-primary)] hover:bg-white/10 transition-all">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${strategy.color.replace('text', 'bg')}`} /> 
                        <span>{story}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Callout Footer */}
              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] space-y-4 relative z-10">
                {strategy.proTip && (
                  <div className="p-4 rounded-xl bg-blue-500/5 group-hover:bg-blue-500/10 border border-blue-500/10 flex gap-3 transition-colors">
                    <Lightbulb className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Coach Insight</p>
                        <p className="text-xs text-blue-400/90 font-medium leading-relaxed">{strategy.proTip}</p>
                    </div>
                  </div>
                )}

                {strategy.bonusTip && (
                  <div className={`p-4 rounded-xl ${strategy.color.replace('text', 'bg')}/5 border border-${strategy.color.split('-')[1]}-500/10 flex gap-3`}>
                    <Star className={`w-5 h-5 ${strategy.color} shrink-0`} />
                    <p className={`text-xs ${strategy.color} font-semibold leading-relaxed`}>
                      {strategy.bonusTip}
                    </p>
                  </div>
                )}

                {strategy.example && (
                  <p className="text-xs text-emerald-400 font-medium italic text-center px-2 opacity-90 transition-opacity">
                    {strategy.example}
                  </p>
                )}

                {strategy.practice && (
                  <div className={`p-4 rounded-xl border border-dashed ${strategy.color.replace('text', 'border')}/30 bg-${strategy.color.split('-')[1]}-500/5 group-hover:bg-${strategy.color.split('-')[1]}-500/10 transition-colors`}>
                    <p className={`text-[11px] ${strategy.color} font-bold text-center leading-relaxed`}>
                      Pro Practice: {strategy.practice}
                    </p>
                  </div>
                )}

                {strategy.advice && (
                  <div className={`p-3.5 rounded-xl bg-white/5 border border-white/5`}>
                     <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase text-center mb-1">Coach Prep</p>
                     <p className="text-xs text-[var(--text-primary)] font-medium text-center leading-relaxed">{strategy.advice}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
