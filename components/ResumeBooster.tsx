"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Copy, CheckCircle2, Wand2, Star, Briefcase, Award } from "lucide-react";
import { generateResumeAchievements } from "@/lib/actions/achievements.action";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ResumeBooster = ({ userId }: { userId: string }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [achievements, setAchievements] = useState<any[] | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        const toastId = toast.loading("AI is synthesizing your career achievements...");
        
        try {
            const result = await generateResumeAchievements(userId);
            if (result && result.success && result.achievements) {
                setAchievements(result.achievements);
                toast.success("Resume achievements generated!", { id: toastId });
            } else {
                toast.error(result?.error || "Failed to generate achievements. Ensure you have high-scoring interviews.", { id: toastId });
            }
        } catch (error) {
            console.error("Achievement generation error:", error);
            toast.error("An unexpected error occurred.", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group shadow-2xl">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-600/5 blur-[100px] rounded-full group-hover:bg-blue-600/10 transition-colors duration-700" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/5 blur-3xl opacity-50" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                             <Sparkles size={14} className="animate-pulse" /> Career Intelligence
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
                            Interactive <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent italic">Resume Booster</span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-lg font-medium leading-relaxed max-w-xl">
                            Our AI analyzes your top mock interview performances and synthesizes professional, high-impact bullet points for your resume.
                        </p>
                    </div>

                    {!achievements ? (
                        <div className="shrink-0">
                            <Button 
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="h-20 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-3xl shadow-[0_20px_40px_rgba(37,99,235,0.2)] active:scale-95 transition-all group/btn"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-4 h-6 w-6 animate-spin" />
                                        Synthesizing...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-4 h-6 w-6 transition-transform group-hover/btn:rotate-12" />
                                        Boost My Resume
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                             <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {achievements && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="mt-14 space-y-6"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px bg-white/5 flex-1" />
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Optimized Career Highlights</span>
                                <div className="h-px bg-white/5 flex-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {achievements.map((item: any, idx: number) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group/card overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                             <button 
                                                onClick={() => copyToClipboard(item.bullet, idx)}
                                                className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
                                                title="Copy to clipboard"
                                             >
                                                {copiedIndex === idx ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                             </button>
                                        </div>

                                        <div className="flex gap-6 items-start">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-sm">
                                                <Award size={20} />
                                            </div>
                                            <div className="space-y-4 flex-1 pr-12">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-white/5 text-[var(--text-secondary)] text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                                                        Skill: {item.skill}
                                                    </span>
                                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">
                                                        Impact: {item.impact}
                                                    </span>
                                                </div>
                                                <p className="text-lg md:text-xl font-bold text-[var(--text-primary)] leading-relaxed italic pr-4">
                                                    "{item.bullet}"
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            
                            <div className="flex justify-center mt-12">
                                 <button 
                                    onClick={() => setAchievements(null)}
                                    className="text-[10px] font-black text-white/30 hover:text-blue-400 uppercase tracking-widest transition-colors flex items-center gap-2"
                                 >
                                    <Star size={12} className="fill-current" /> Reset Analysis
                                 </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!achievements && !isGenerating && (
                    <div className="mt-12 flex flex-wrap gap-8 justify-center md:justify-start border-t border-white/5 pt-10">
                        {[
                            { icon: <Star className="text-yellow-500" />, text: "Action-Oriented Language" },
                            { icon: <Star className="text-yellow-500" />, text: "Quantifiable Performance Metrics" },
                            { icon: <Star className="text-yellow-500" />, text: "Professional Grade Synthesis" },
                        ].map((tip, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs font-bold text-white/40">
                                {tip.icon}
                                {tip.text}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeBooster;
