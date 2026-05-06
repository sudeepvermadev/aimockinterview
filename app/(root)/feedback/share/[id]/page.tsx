"use client";

import dayjs from "dayjs";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Star,
  Zap,
  Quote,
  Globe,
  Camera,
  Mic,
  Wifi,
  Layout,
  Smartphone,
  Coffee,
  Trophy,
  Target,
  Users,
  Brain,
  ShieldCheck,
  Monitor,
  CheckCircle,
  Activity,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPublicFeedbackById, getInterviewById, getUserPublicInfo } from "@/lib/actions/general.action";
import ShareSummaryCard from "@/components/ShareSummaryCard";


export default function PublicFeedbackPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [publicUser, setPublicUser] = useState<any>(null);


  useEffect(() => {
    async function loadData() {
      try {
        const fb: any = await getPublicFeedbackById(id);
        if (fb) {
          setFeedback(fb);
          const [iv, userInfo] = await Promise.all([
            getInterviewById(fb.interviewId),
            getUserPublicInfo(fb.userId)
          ]);
          setInterview(iv);
          setPublicUser(userInfo);
        } else {

          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error loading public feedback:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 scale-110"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md p-12 bg-slate-900/50 rounded-[3rem] border border-white/10 backdrop-blur-xl"
        >
          <Globe className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Private Content</h2>
          <p className="text-slate-500 leading-relaxed font-medium">This interview feedback has not been made public by the candidate or the link has expired.</p>
        </motion.div>
      </div>
    );
  }

  const score = feedback.totalScore || 0;
  const role = interview?.role || "Candidate";
  const numQuestions = feedback.comparisons?.length || 0;
  const avgAccuracy = numQuestions > 0 ? Math.round(score) : 0;

  return (
    <main className="min-h-screen bg-slate-950 pb-20 relative overflow-hidden font-sans">
      {/* Dynamic Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[15%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-blue-400/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-12">
        
        {/* BRANDED HEADER */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-12 border-b border-white/5"
        >
            <div className="flex items-center gap-6">
                <div className="p-4 bg-white/5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
                    <Image
                        src="/logonew.png"
                        alt="PrepEdge Logo"
                        height={60}
                        width={60}
                        className="object-contain"
                    />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">
                        Prep<span className="text-blue-500">Edge</span>
                    </h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
                        <Globe className="w-3 h-3" /> Certified Performance
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:items-end text-left md:text-right">
                <p className="text-2xl font-black text-white leading-none tracking-tight">Verified Candidate Report</p>
                <div className="flex items-center gap-3 mt-3">
                    <span className="text-slate-500 text-sm font-bold">{role} Interview</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-slate-500 text-sm font-bold">{dayjs(feedback.createdAt).format("MMM DD, YYYY")}</span>
                </div>
            </div>
        </motion.div>

        {/* SHARE SUMMARY CARD */}
        {publicUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="flex justify-center"
          >
             <ShareSummaryCard 
                user={{
                  name: publicUser.name,
                  email: publicUser.email,
                  photoURL: publicUser.photoURL,
                  streakCount: publicUser.streakCount,
                  initial: publicUser.name.charAt(0)
                }}
                stats={{
                  totalInterviews: publicUser.analytics?.totalInterviews || 0,
                  averageScore: publicUser.analytics?.averageScore || 0,
                  badgeCount: publicUser.badges?.length || 0
                }}
             />
          </motion.div>
        )}

        {/* HERO METRICS */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 flex flex-col md:flex-row items-center gap-10 bg-slate-900/40 p-10 rounded-[3.5rem] border border-white/5 backdrop-blur-xl shadow-2xl"
            >
                <div className="relative flex items-center justify-center w-56 h-56 rounded-full bg-slate-950/50 border-8 border-white/5 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                    {/* Progress Ring Logic simplified for UI */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="112"
                            cy="112"
                            r="96"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            className="text-blue-500/10"
                        />
                        <circle
                            cx="112"
                            cy="112"
                            r="96"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeDasharray={603}
                            strokeDashoffset={603 - (603 * score) / 100}
                            strokeLinecap="round"
                            className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="relative text-center">
                        <span className="text-7xl font-black text-white tracking-tighter">{score}</span>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1 -mr-[0.4em]">Index</p>
                    </div>
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <h1 className="text-3xl font-black text-white tracking-tight">Executive Appraisal</h1>
                    <p className="text-slate-400 leading-relaxed font-bold text-lg">
                        {feedback.finalAssessment || "A comprehensive evaluation of the candidate's technical and communicative competencies during the simulated interview session."}
                    </p>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 lg:grid-cols-1 gap-6"
            >
                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all">
                    <Target className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-3xl font-black text-white">{avgAccuracy}%</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Accuracy</span>
                </div>
                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all">
                    <Activity className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-3xl font-black text-white">{numQuestions}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Segments</span>
                </div>
            </motion.div>
        </div>

        {/* FEEDBACK COMPARISONS */}
        {feedback.comparisons && feedback.comparisons.length > 0 ? (
          <div className="space-y-10">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <h2 className="text-2xl font-black text-white tracking-tight">Granular Analysis</h2>
                <div className="h-0.5 flex-1 bg-white/5" />
                <Award className="w-6 h-6 text-slate-700" />
            </div>
            
            <div className="grid grid-cols-1 gap-12">
                {feedback.comparisons.map((comp: any, i: number) => {
                  const weightPerQuestion = Math.max(1, Math.floor(100 / (feedback.comparisons?.length || 1)));
                  const percentage = Math.round((comp.marksAwarded / weightPerQuestion) * 100) || 0;
                  
                  // Color logic for marks
                  let accentColor = "blue";
                  if (percentage >= 80) accentColor = "emerald";
                  else if (percentage >= 50) accentColor = "amber";
                  else accentColor = "rose";

                  const colorMap: any = {
                    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/10",
                    blue: "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/10",
                    amber: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/10",
                    rose: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/10"
                  };

                  return (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="group space-y-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Interview Question 0{i + 1}</span>
                            <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">{comp.question}</h3>
                        </div>
                        <div className="flex flex-col items-end shrink-0 bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden min-w-[140px]">
                            <div className={cn("text-4xl font-black tracking-tighter relative z-10", `text-${accentColor}-400`)}>{percentage}%</div>
                            <div className="text-[11px] text-slate-400 font-bold tracking-tight relative z-10 mt-1">
                                Score: <span className="text-white">{comp.marksAwarded ?? 0}</span> / {weightPerQuestion}
                            </div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black mt-2 relative z-10 opacity-50">Match Index</div>
                            <div className={cn("absolute inset-0 opacity-5 bg-gradient-to-br", `from-${accentColor}-500 to-transparent`)} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        {/* USER ANSWER CARD */}
                        <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/card hover:bg-slate-900/60 transition-all duration-500">
                          <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                <Users className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Answer</span>
                          </div>
                          <p className="text-slate-300 text-base leading-relaxed font-medium italic min-h-[80px]">"{comp.userResponse}"</p>
                          <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/card:opacity-10 transition-opacity">
                             <Quote className="w-24 h-24 text-white" />
                          </div>
                        </div>
                        
                        {/* IDEAL ANSWER CARD */}
                        <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/10 relative overflow-hidden group/card hover:bg-emerald-500/10 transition-all duration-500">
                          <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-emerald-600/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">AI Assistant Answer</span>
                          </div>
                          <p className="text-emerald-100/80 text-base leading-relaxed font-bold min-h-[80px]">{comp.correctAnswer}</p>
                          <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] animate-pulse">
                             <CheckCircle2 className="w-24 h-24 text-emerald-400" />
                          </div>
                        </div>
                      </div>
                      
                      {comp.feedback && (
                        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 group hover:border-blue-500/20 transition-all space-y-4">
                          <p className="text-slate-400 text-sm leading-relaxed">
                            <span className="font-black text-blue-400 uppercase text-[10px] tracking-widest block mb-1">Technical Guidance:</span> 
                            {comp.feedback}
                          </p>
                          {comp.proTip && (
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-blue-200/90 text-sm leading-relaxed">
                                    <span className="font-black text-indigo-400 uppercase text-[10px] tracking-widest block mb-1">AI Pro Tip:</span> 
                                    {comp.proTip}
                                </p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-white tracking-tight border-b border-white/5 pb-4">Session Transcript</h2>
            <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {feedback.transcript?.map((t: any, i: number) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className={cn(
                        "p-6 rounded-3xl max-w-[80%] transition-all", 
                        t.role === "user" 
                            ? "bg-blue-600/10 border border-blue-500/20 text-blue-100 ml-auto" 
                            : "bg-white/5 border border-white/10 text-slate-300 mr-auto"
                    )}
                >
                  <p className="text-[10px] font-black mb-2 opacity-50 uppercase tracking-[0.2em]">{t.role === 'user' ? 'Candidate' : 'Alex (Agent)'}</p>
                  <p className="text-sm font-medium leading-relaxed">{t.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* AI PRO TIP AT BOTTOM */}
        <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 p-12 rounded-[4rem] border border-blue-500/20 mt-20 relative overflow-hidden group shadow-2xl"
        >
            <div className="relative z-10">
                <h3 className="text-xl font-black text-blue-400 mb-6 tracking-widest flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 animate-pulse" /> PERFORMANCE OPTIMIZATION
                </h3>
                <p className="text-white text-2xl font-bold leading-snug tracking-tight max-w-3xl italic">
                    "{feedback.aiProTip || feedback.finalAssessment || "The key to mastering technical interviews is to explain your thought process while implementing solutions."}"
                </p>
                <div className="mt-8">
                    <button className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
                        Deep Dive Strategy <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-700">
               <Zap className="w-48 h-48 text-blue-500" />
            </div>
        </motion.div>

        <div className="pt-24 border-t border-white/5 text-center pb-10">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.6em]">Digitally Certified by PrepEdge Neural Infrastructure</p>
            <p className="text-slate-700 text-[11px] font-bold mt-6 tracking-wide italic">Verified under Global Appraisal Protocol v4.2</p>
            <p className="text-slate-500 text-[10px] font-bold mt-10">© {dayjs().year()} PrepEdge Analytics Engine &bull; Secure Protocol</p>
        </div>

      </div>
    </main>
  );
}

