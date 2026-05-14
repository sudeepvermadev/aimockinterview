"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Sparkles, Loader2, Wand2, ArrowRight, ShieldCheck } from "lucide-react";
import { generateJobSpecificQuestions } from "@/lib/actions/job-boost.action";
import { deductCoins } from "@/lib/actions/payment.action";
import { auth, db } from "@/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Coins } from "lucide-react";

const JobBoostModal = () => {
    const [open, setOpen] = useState(false);
    const [jdText, setJdText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const router = useRouter();

    const handleAnalyze = async () => {
        if (jdText.length < 50) {
            toast.error("Please provide a more detailed Job Description.");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            toast.error("Please sign in to use this feature.");
            return;
        }

        setIsAnalyzing(true);
        const toastId = toast.loading("Checking premium access...");

        try {
            // 1. Check User Status (Pro vs Coins)
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                toast.error("User profile not found.", { id: toastId });
                setIsAnalyzing(false);
                return;
            }

            const userData = userDoc.data();
            const isPro = userData.isPro || false;
            const balance = userData.walletBalance || 0;
            const BOOST_COST = 50;

            if (!isPro) {
                if (balance < BOOST_COST) {
                    toast.error(`Low Balance: Job Boost costs ${BOOST_COST} PrepCoins. Please recharge.`, { 
                        id: toastId,
                        description: "You need 50 PrepCoins to use this premium tool."
                    });
                    router.push("/pricing");
                    setOpen(false);
                    return;
                }
                
                // Deduct Coins
                toast.loading(`Deducting ${BOOST_COST} PrepCoins...`, { id: toastId });
                const deductResult = await deductCoins(user.uid, BOOST_COST, "Job-Specific Boost");
                if (!deductResult.success) {
                    toast.error(deductResult.message, { id: toastId });
                    setIsAnalyzing(false);
                    return;
                }
            }

            // 2. Generate Questions
            toast.loading("AI is analyzing the JD and generating your customized questions...", { id: toastId });
            const result = await generateJobSpecificQuestions(jdText);
            if (result.success && result.data) {
                toast.success(isPro ? "Pro Boost Activated!" : "50 PrepCoins Used. Boost Activated!", { id: toastId });
                
                const queryParams = new URLSearchParams({
                    role: result.data.role,
                    type: "Job Specific",
                    questions: JSON.stringify(result.data.questions),
                    techstack: result.data.techstack.join(", "),
                    jdBoost: "true"
                });

                router.push(`/interview?${queryParams.toString()}`);
                setOpen(false);
            } else {
                toast.error(result.error || "Failed to analyze JD", { id: toastId });
            }
        } catch (error) {
            console.error("Job Boost Error:", error);
            toast.error("An unexpected error occurred.", { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative group p-[1px] rounded-[32px] overflow-hidden cursor-pointer active:scale-95 transition-all">
                    {/* Pulsing Border Gradient */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-[32px] opacity-20 group-hover:opacity-100 blur-[2px] transition duration-500 animate-pulse"></div>
                    
                    <div className="relative flex items-center justify-between gap-6 px-8 py-10 bg-[#0d0d12]/95 border border-white/10 rounded-[32px] backdrop-blur-3xl">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                    <Briefcase className="w-6 h-6 text-blue-400" />
                                </div>
                                <span className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em]">Premium Feature</span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Job Specific <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Prep Boost</span></h3>
                            <p className="text-white/50 text-sm max-w-sm leading-relaxed">
                                Paste a Job Description and let our AI generate the exact questions they'll likely ask you.
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-center gap-2">
                             <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                <Sparkles className="w-8 h-8 text-blue-400" />
                             </div>
                             <div className="flex items-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-widest mt-2 group-hover:text-blue-400 transition-colors">
                                Use Boost <ArrowRight size={10} />
                             </div>
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-[#0d0d12] border border-white/10 rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Briefcase className="w-5 h-5 text-blue-400" />
                        </div>
                        Activate Job Boost
                    </DialogTitle>
                    <DialogDescription className="text-white/50 pt-2 leading-relaxed">
                        Paste the Job Description below. We'll analyze it to prepare a custom mock interview session for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="relative">
                        <Textarea 
                            placeholder="Paste Job Description here (Min 50 chars)..."
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            className="min-h-[250px] bg-white/[0.02] border-white/10 text-white rounded-2xl p-6 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-white/20 resize-none leading-relaxed"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            {jdText.length} Characters
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || jdText.length < 50}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-3 h-5 w-5" />
                                    Analyze & Prep (50 Coins)
                                </>
                            )}
                        </Button>

                        <div className="flex items-center justify-center gap-4 text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] pt-2">
                             <div className="flex items-center gap-1.5">
                                <ShieldCheck size={12} className="text-emerald-500/50" />
                                Secure
                             </div>
                             <div className="flex items-center gap-1.5">
                                <Coins size={12} className="text-amber-500/50" />
                                50 PrepCoins
                             </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default JobBoostModal;
