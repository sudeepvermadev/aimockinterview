"use client";

import dayjs from "dayjs";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPublicFeedbackById, getInterviewById } from "@/lib/actions/general.action";

export default function PublicFeedbackPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const fb: any = await getPublicFeedbackById(id);
        if (fb) {
          setFeedback(fb);
          const iv = await getInterviewById(fb.interviewId);
          setInterview(iv);
        } else {
          // If not public or doesn't exist
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
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/10"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
        <div className="text-center max-w-md p-12 bg-slate-900/50 rounded-[3rem] border border-white/10 backdrop-blur-xl">
          <Globe className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Private Content</h2>
          <p className="text-slate-500 leading-relaxed">This interview feedback has not been made public by the candidate or the link has expired.</p>
        </div>
      </div>
    );
  }

  const score = feedback.totalScore || 0;
  const role = interview?.role || "Candidate";

  return (
    <main className="min-h-screen bg-slate-950 pb-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-10 py-16 space-y-12 bg-slate-950 mt-10 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl">
        
        {/* BRANDED HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-12 border-b border-white/10">
            <div className="flex items-center gap-5">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
                    <Image
                        src="/logonew.png"
                        alt="PrepEdge Logo"
                        height={54}
                        width={48}
                        className="object-contain"
                    />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">
                        Prep<span className="text-blue-500">Edge</span>
                    </h2>
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest mt-2">
                        <Globe className="w-2.5 h-2.5" /> Public Certificate
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:items-end text-left md:text-right">
                <p className="text-xl font-black text-white leading-none tracking-tight">Verified Candidate Report</p>
                <p className="text-slate-500 text-sm font-medium mt-2">{role} Interview &bull; {dayjs(feedback.createdAt).format("MMM DD, YYYY")}</p>
            </div>
        </div>

        {/* OVERALL SCORE SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
            <div>
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Interview Performance</h1>
                <p className="text-slate-400 leading-relaxed font-bold">
                    This certified AI-appraisal visualizes the candidate's core proficiencies across multiple domains.
                </p>
            </div>
            <div className="flex justify-center md:justify-end">
                <div className="relative flex flex-col items-center justify-center w-48 h-48 rounded-full bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.2)] border-8 border-white/5">
                    <span className="text-6xl font-black text-white tracking-tighter">{score}</span>
                    <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] mt-1">Score</span>
                </div>
            </div>
        </div>

        {/* METRICS BREAKDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5">
                <h3 className="text-lg font-black text-white mb-6 tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Professional Strengths
                </h3>
                <ul className="space-y-4 text-slate-400 text-sm font-bold">
                    {feedback.strengths?.map((s: string, i: number) => (
                        <li key={i} className="flex gap-3">
                            <span className="text-emerald-500 font-extrabold">•</span> {s}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5">
                <h3 className="text-lg font-black text-white mb-6 tracking-tight flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" /> Performance Analysis
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed italic border-l-4 border-blue-600 pl-5 font-bold">
                    "{feedback.finalAssessment}"
                </p>
            </div>
        </div>

        {/* SECTIONAL APPRAISAL */}
        <div className="space-y-10">
            <h2 className="text-2xl font-black text-white tracking-tight border-b border-white/5 pb-4">Key Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {feedback.categoryScores?.map((cat: any, i: number) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{cat.name}</p>
                        <p className="text-3xl font-black text-blue-400">{cat.score}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* NEW SECTIONS: PREP & GUIDANCE */}
        <div className="space-y-16 pt-16 border-t border-white/10">
          {/* STAR METHOD SECTION */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-2 bg-emerald-500 h-10 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
              <h2 className="text-3xl font-black text-white tracking-tight">Master the STAR Method</h2>
            </div>
            
            <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
               <Trophy className="w-40 h-40 text-emerald-500" />
              </div>
              
              <p className="text-slate-400 font-bold mb-10 max-w-2xl">
                The STAR method is the gold standard for answering behavioral interview questions. It provides a clear structure that keeps your answers focused and impactful.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { letter: "S", title: "Situation", desc: "Set the context (When? Where? What was happening?)", color: "text-blue-400", bg: "bg-blue-500/10" },
                  { letter: "T", title: "Task", desc: "Describe the challenge or objective (What was your responsibility?)", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { letter: "A", title: "Action", desc: "Explain what YOU specifically did (Focus on YOUR contributions)", color: "text-amber-400", bg: "bg-amber-500/10" },
                  { letter: "R", title: "Result", desc: "Share the measurable outcome (Use numbers and metrics)", color: "text-rose-400", bg: "bg-rose-500/10" },
                ].map((item, idx) => (
                  <div key={idx} className="relative p-6 rounded-[2rem] bg-slate-950 border border-white/5 group hover:border-white/10 transition-colors">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl mb-4", item.bg, item.color)}>
                      {item.letter}
                    </div>
                    <h4 className="text-white font-black mb-2">{item.title}</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Impact Example</span>
                </div>
                <p className="text-white font-bold italic">
                  "Increased team productivity by 35% through implementing agile methodology" 
                  <span className="text-slate-500 font-medium ml-2">is better than</span> 
                  <span className="text-slate-500 font-medium italic ml-1">"I helped the team work better."</span>
                </p>
              </div>
            </div>
          </div>

          {/* TECH & ENVIRONMENT SECTION */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-2 bg-blue-500 h-10 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              <h2 className="text-3xl font-black text-white tracking-tight">Technical Readiness</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md">
                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                  <Layout className="w-6 h-6 text-blue-500" /> Environmental Setup
                </h3>
                <div className="space-y-6">
                  {[
                    { icon: <Camera className="w-4 h-4" />, label: "Camera", desc: "Position at eye level, test lighting (face a window or use a lamp)" },
                    { icon: <Mic className="w-4 h-4" />, label: "Microphone", desc: "Use headphones or external mic for better audio quality" },
                    { icon: <Wifi className="w-4 h-4" />, label: "Internet", desc: "Test connection speed, close unnecessary applications" },
                    { icon: <Layout className="w-4 h-4" />, label: "Background", desc: "Clean, professional, minimal distractions" },
                  ].map((check, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        {check.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{check.label}</h4>
                        <p className="text-slate-500 text-[11px] font-medium mt-1">{check.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md">
                  <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-blue-500" /> Continuity Plan
                  </h3>
                  <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-400 shrink-0 border border-white/5">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">Platform Testing</h4>
                        <p className="text-slate-500 text-[11px] font-medium mt-1">Download required software, test joining a meeting early.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-400 shrink-0 border border-white/5">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">Backup Strategy</h4>
                        <p className="text-slate-500 text-[11px] font-medium mt-1">Have phone hotspot ready and an alternative device available.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                    <Coffee className="w-20 h-20 text-white" />
                  </div>
                  <h4 className="text-white font-black text-lg mb-2">Pro Tip</h4>
                  <p className="text-blue-50 text-xs font-bold leading-relaxed relative z-10">
                    Keep a glass of water nearby and have your resume, job description, and notes within view.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BEHAVIORAL QUESTIONS SECTION */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-2 bg-indigo-500 h-10 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              <h2 className="text-3xl font-black text-white tracking-tight">Behavioral Mastery</h2>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md">
              <p className="text-slate-400 font-bold mb-10 max-w-2xl">
                Prepare 5-7 detailed stories that demonstrate your core competencies. Each story should be versatile enough to answer multiple questions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: <Users className="w-5 h-5" />, title: "Leadership & Teamwork", color: "bg-blue-500/20 text-blue-400" },
                  { icon: <Brain className="w-5 h-5" />, title: "Problem-solving", color: "bg-emerald-500/20 text-emerald-400" },
                  { icon: <AlertTriangle className="w-5 h-5" />, title: "Handling Conflict", color: "bg-amber-500/20 text-amber-400" },
                  { icon: <Zap className="w-5 h-5" />, title: "Initiative & Ownership", color: "bg-indigo-500/20 text-indigo-400" },
                  { icon: <Target className="w-5 h-5" />, title: "Learning from Failure", color: "bg-rose-500/20 text-rose-400" },
                  { icon: <CheckCircle className="w-5 h-5" />, title: "Adapting to Change", color: "bg-cyan-500/20 text-cyan-400" },
                ].map((card, i) => (
                  <div key={i} className="p-8 rounded-[2rem] bg-slate-950 border border-white/5 hover:border-white/10 transition-all group">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform", card.color.split(" ")[0])}>
                       <div className={card.color.split(" ")[1]}>{card.icon}</div>
                    </div>
                    <h4 className="text-white font-bold tracking-tight">{card.title}</h4>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-8 rounded-[2rem] border border-dashed border-white/10 text-center">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Practice Tip</p>
                <p className="text-white font-bold mt-2">Practice telling these stories concisely (2-3 minutes max) while hitting all STAR method points.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-white/10 text-center pb-4">
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.5em]">Digitally Certified by PrepEdge Infrastructure</p>
            <p className="text-slate-500 text-[10px] font-bold mt-4">© {dayjs().year()} PrepEdge Analytics Engine</p>
        </div>

      </div>
    </main>
  );
}
