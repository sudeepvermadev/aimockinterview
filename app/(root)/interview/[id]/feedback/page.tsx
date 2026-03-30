"use client";

import dayjs from "dayjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  AlertTriangle, 
  MessageSquare, 
  ArrowLeft,
  Star,
  Zap,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInterviewById, getFeedbackByInterviewId } from "@/lib/actions/general.action";

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      const localInterviews = JSON.parse(localStorage.getItem("mock_interviews") || "[]");
      const localMatch = localInterviews.find((i: any) => i.id === id);

      if (localMatch) {
        setInterviewData(localMatch);
      } else {
        try {
          const serverInterview = await getInterviewById(id);
          const serverFeedback = await getFeedbackByInterviewId({ interviewId: id, userId: "user1" });
          if (serverInterview) {
            setInterviewData({ ...serverInterview, feedback: serverFeedback });
          } else {
            router.push("/");
          }
        } catch (error) {
          router.push("/");
        }
      }
      setLoading(false);
    }
    loadData();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  if (!interviewData) return null;

  const { role, feedback, createdAt } = interviewData;
  const score = feedback?.totalScore || 0;
  
  // Logical pairing helper (Same as your logic, optimized)
  const transcript = feedback?.transcript || [];
  const pairs: any[] = [];
  let lastQ = "";
  transcript.forEach((msg: any) => {
    if (msg.role === "assistant") lastQ = msg.content;
    else if (msg.role === "user") {
      pairs.push({ q: lastQ || "General Question", a: msg.content });
      lastQ = "";
    }
  });

  return (
    <main className="min-h-screen bg-[#030305] text-slate-200 selection:bg-blue-500/30 pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <div className="flex gap-3">
            <Button onClick={() => {}} variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl">
                <Download className="w-4 h-4 mr-2" /> Report
            </Button>
            <Button onClick={() => setCopied(true)} className="bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20">
                <Share2 className="w-4 h-4 mr-2" /> {copied ? "Copied" : "Share"}
            </Button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-8">
        
        {/* Top Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900/50 to-slate-900/20 border border-white/5 backdrop-blur-md flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 w-fit">
              <Zap className="w-3 h-3" /> Interview Complete
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Analysis for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 capitalize">{role}</span>
            </h1>
            <p className="text-slate-400 text-lg">
                Conducted on {dayjs(createdAt).format("MMMM D, YYYY")} &bull; 15 Minute Session
            </p>
          </div>

          {/* Score Card */}
          <div className="p-10 rounded-[2.5rem] bg-blue-600 flex flex-col items-center justify-center text-center shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
            <div className="relative z-10">
              <p className="text-blue-100 font-medium mb-2 opacity-80 uppercase text-xs tracking-[0.2em]">Readiness Score</p>
              <div className="text-8xl font-black text-white mb-2 drop-shadow-2xl">
                {score}
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${score}%` }}></div>
              </div>
              <p className="mt-4 text-blue-100/70 text-sm font-medium italic">
                {score > 80 ? "You're Hire-Ready!" : "Solid effort, keep refining."}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0e0f15] p-8 rounded-[2rem] border border-white/5 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="text-emerald-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Key Strengths</h3>
            <ul className="space-y-4 text-slate-400 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">•</span> Strong technical vocabulary and clear explanation of concepts.
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">•</span> Confident tone and consistent pacing throughout.
              </li>
            </ul>
          </div>

          <div className="bg-[#0e0f15] p-8 rounded-[2rem] border border-white/5 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
              <AlertTriangle className="text-amber-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Improvement Areas</h3>
            <ul className="space-y-4 text-slate-400 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold">•</span> Use the STAR method to structure behavioral responses.
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold">•</span> Avoid repetitive fillers like "um" or "like" during transitions.
              </li>
            </ul>
          </div>

          <div className="bg-[#0e0f15] p-8 rounded-[2rem] border border-white/5 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Star className="text-blue-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">AI Assessment</h3>
            <p className="text-slate-400 text-sm leading-relaxed italic">
              "Overall, you demonstrate a senior-level understanding of the role. Focusing on more specific metrics in your examples will push your score above 90."
            </p>
          </div>
        </div>

        {/* Deep Dive Transcript */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <MessageSquare className="text-blue-500 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">Detailed Transcript Analysis</h2>
          </div>

          <div className="space-y-8">
            {pairs.map((pair, i) => (
              <div key={i} className="group relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Answer */}
                  <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <Quote className="w-3 h-3" /> Question {i + 1}
                    </div>
                    <p className="text-white font-medium mb-4">{pair.q}</p>
                    <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 text-orange-200/80 text-sm italic">
                      "{pair.a}"
                    </div>
                  </div>

                  {/* Ideal Answer */}
                  <div className="bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10">
                     <div className="flex items-center gap-2 mb-4 text-xs font-bold text-blue-400 uppercase tracking-widest">
                       <Zap className="w-3 h-3" /> Recommended Improvement
                    </div>
                    <p className="text-blue-100/90 text-sm leading-relaxed">
                        To improve this, emphasize your direct contribution. Instead of "We built...", use "I architected the core module which resulted in a 20% performance boost."
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}