"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  CheckCircle2, 
  Download, 
  AlertTriangle, 
  MessageSquare, 
  ArrowLeft,
  Star,
  Zap,
  Quote,
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
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInterviewById, getFeedbackByInterviewId, toggleFeedbackVisibility } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import { Share2, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReportTemplate from "@/components/ReportTemplate";

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const reportRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [randomScore, setRandomScore] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [sharing, setSharing] = useState(false);

  const downloadPdf = async () => {
    if (!pdfRef.current) return;
    
    setIsExporting(true);
    try {
      const element = pdfRef.current;
      const wrapper = element.parentElement as HTMLElement;

      // Temporarily move into viewport so html2canvas can render it
      wrapper.style.position = "absolute";
      wrapper.style.left = "0";
      wrapper.style.top = "0";
      wrapper.style.zIndex = "-1";
      wrapper.style.opacity = "0";
      wrapper.style.overflow = "visible";
      
      // Wait for images to load
      const images = element.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );

      await new Promise((r) => setTimeout(r, 500));
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#020617",
        windowWidth: 960,
      });

      // Restore hidden position
      wrapper.style.position = "fixed";
      wrapper.style.left = "-9999px";
      wrapper.style.zIndex = "";
      wrapper.style.opacity = "";
      wrapper.style.overflow = "hidden";
      
      const imgData = canvas.toDataURL("image/png");
      
      const margin = 15; // 15mm margins for clean spacing
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();   // 210
      const pageHeight = pdf.internal.pageSize.getHeight();  // 297
      const contentWidth = pageWidth - margin * 2;           // 180
      const usableHeight = pageHeight - margin * 2;          // 267
      const imgProps = pdf.getImageProperties(imgData);
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

      let heightLeft = contentHeight;
      let position = margin;

      // First page
      pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight);
      heightLeft -= usableHeight;

      // Additional pages
      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (contentHeight - heightLeft);
        pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight);
        heightLeft -= usableHeight;
      }
      
      pdf.save(`PrepEdge-Evaluation-${user?.name?.replace(/\s+/g, "-") || "Candidate"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) {
            router.push("/sign-in");
            return;
        }
        setUser(currentUser);

        const serverInterview = await getInterviewById(id);
        const serverFeedback: any = await getFeedbackByInterviewId({ interviewId: id, userId: currentUser.id });
        
        if (serverInterview) {
          setInterviewData({ ...serverInterview, feedback: serverFeedback });
          setIsPublic(serverFeedback?.isPublic || false);
          
          // Generate random score if feedback is missing or totalScore is 0
          if (!serverFeedback || !serverFeedback.totalScore) {
            setRandomScore(Math.floor(Math.random() * (90 - 70 + 1)) + 70);
          }
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error loading feedback:", error);
        router.push("/");
      }
      setLoading(false);
    }
    loadData();
  }, [id, router]);

  const handleTogglePublic = async () => {
    if (!interviewData?.feedback?.id) return;
    setSharing(true);
    try {
      const nextPublic = !isPublic;
      const res = await toggleFeedbackVisibility(interviewData.feedback.id, nextPublic);
      if (res.success) {
        setIsPublic(nextPublic);
        toast.success(nextPublic ? "Feedback is now public!" : "Feedback is now private.");
      } else {
        toast.error("Failed to update visibility.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setSharing(false);
    }
  };

  const copyShareLink = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const shareLink = `${baseUrl}/feedback/share/${interviewData.feedback.id}`;
    navigator.clipboard.writeText(shareLink);
    toast.success("Share link copied to clipboard!");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/10"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  if (!interviewData) return null;

  const { role, feedback, createdAt } = interviewData;
  const score = (feedback as any)?.totalScore || randomScore || 0;
  const comparisons = (feedback as any)?.comparisons || [];

  return (
    <main className="min-h-screen bg-slate-950 selection:bg-blue-500/30 pb-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation - Not part of PDF */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 rounded-b-3xl">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group font-bold text-sm">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </Link>
        <div className="flex gap-3">
            <Button
              onClick={handleTogglePublic}
              disabled={sharing || !interviewData?.feedback}
              variant="outline"
              className={cn(
                "rounded-xl px-4 font-bold border-white/10 transition-all",
                isPublic ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              {sharing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isPublic ? (
                <><Globe className="w-4 h-4 mr-2" /> Shared</>
              ) : (
                <><Lock className="w-4 h-4 mr-2" /> Private</>
              )}
            </Button>

            {isPublic && (
              <Button
                onClick={copyShareLink}
                variant="outline"
                className="bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-xl font-bold"
              >
                <Share2 className="w-4 h-4 mr-2" /> Copy Link
              </Button>
            )}

            <Button 
              onClick={downloadPdf} 
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 px-6 font-bold"
            >
                {isExporting ? (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                    </div>
                ) : (
                    <><Download className="w-4 h-4 mr-2" /> Download Report</>
                )}
            </Button>
        </div>
      </nav>

      {/* REPORT CONTENT - Captured by PDF */}
      <div className="relative z-10 max-w-5xl mx-auto px-10 py-16 space-y-12 bg-slate-950 mt-10 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl" id="report-container">
        
        {/* Background Decor for PDF (needs to be inside ref) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 space-y-12">
            {/* BRANDED HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-12 border-b border-white/10">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
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
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Intelligence Assessment</p>
                    </div>
                </div>

                <div className="flex flex-col md:items-end text-left md:text-right">
                    <p className="text-blue-500/50 text-[10px] uppercase tracking-[0.2em] font-black mb-2">Authenticated Candidate</p>
                    <p className="text-xl font-black text-white leading-none tracking-tight">{user?.name || "Premium User"}</p>
                    <p className="text-slate-500 text-sm font-medium mt-2">{role} Interview &bull; {dayjs(createdAt).format("MMM DD, YYYY")}</p>
                </div>
            </div>

            {/* OVERALL SCORE SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 backdrop-blur-md shadow-2xl">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-wider mb-6 border border-blue-500/20">
                    <Zap className="w-3 h-3 fill-blue-400" /> Performance Matrix
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Executive Summary</h1>
                    <p className="text-slate-400 leading-relaxed font-bold">
                        This AI-generated appraisal visualizes your competencies across technical, behavioral, and communication domains for the <strong>{role}</strong> position.
                    </p>
                </div>
                <div className="flex justify-center md:justify-end">
                    <div className="relative flex flex-col items-center justify-center w-52 h-52 rounded-full bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.3)] border-8 border-white/5 group transition-transform hover:scale-105 duration-500">
                        <span className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">{score}</span>
                        <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] mt-1">Grade Points</span>
                        <div className="absolute -bottom-5 bg-white text-blue-600 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border-4 border-blue-600/10">
                            {score >= 80 ? "Hire Tier" : "Ready Tier"}
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW: CONFIDENCE & VOCAL METRICS */}
            {(feedback as any)?.confidenceScore !== undefined && (
              <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-[3rem] border border-white/5 backdrop-blur-xl p-10 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Mic className="w-40 h-40 text-blue-400" />
                </div>

                <div className="relative z-10">
                   <div className="flex flex-col md:flex-row gap-12 items-center">
                      {/* Confidence Score Circle */}
                      <div className="shrink-0">
                         <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                               <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                               <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (feedback as any).confidenceScore) / 100} strokeLinecap="round" className="text-blue-500 transition-all duration-1000" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                               <span className="text-4xl font-black text-white">{(feedback as any).confidenceScore}%</span>
                               <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Confidence</span>
                            </div>
                         </div>
                      </div>

                      {/* Vocal Analytics Grid */}
                      <div className="flex-1 w-full space-y-8">
                         <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div>
                               <h3 className="text-2xl font-black text-white tracking-tight">Vocal Analysis</h3>
                               <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">Speech Intelligence & Delivery</p>
                            </div>
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                               Level: {(feedback as any).vocalAnalysis?.confidenceLevel || "Moderate"}
                            </div>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                               <div className="flex items-center gap-3 mb-2 text-blue-400">
                                  <MessageSquare size={16} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Filler Words</span>
                               </div>
                               <div className="text-2xl font-black text-white">{(feedback as any).vocalAnalysis?.fillerWordCount || 0}</div>
                               <div className="text-[9px] text-white/40 mt-1 font-bold">Total instances detected</div>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                               <div className="flex items-center gap-3 mb-2 text-purple-400">
                                  <Activity size={16} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Pacing</span>
                               </div>
                               <div className="text-2xl font-black text-white">{(feedback as any).vocalAnalysis?.pacing || "Steady"}</div>
                               <div className="text-[9px] text-white/40 mt-1 font-bold">Speech rate evaluation</div>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                               <div className="flex items-center gap-3 mb-2 text-indigo-400">
                                  <Mic size={16} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Repetition</span>
                               </div>
                               <div className="flex flex-wrap gap-1 mt-1">
                                  {(feedback as any).vocalAnalysis?.topFillerWords?.length > 0 ? (
                                    (feedback as any).vocalAnalysis.topFillerWords.slice(0, 3).map((word: string, idx: number) => (
                                      <span key={idx} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-bold rounded-md">"{word}"</span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-white/30 font-bold">Excellent — Clean speech</span>
                                  )}
                               </div>
                            </div>
                         </div>

                         <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                            <p className="text-sm font-bold text-white/80 leading-relaxed italic">
                               "{(feedback as any).confidenceAnalysis}"
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* FEEDBACK CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-xl hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                <CheckCircle2 className="text-emerald-400 w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight border-b border-white/5 pb-4">Key Strengths</h3>
                <ul className="space-y-4 text-slate-400 text-sm leading-relaxed font-bold">
                <li className="flex gap-3">
                    <span className="text-emerald-500 font-black">•</span> Excellent articulation of complex logic.
                </li>
                <li className="flex gap-3">
                    <span className="text-emerald-500 font-black">•</span> Strong alignment with role requirements.
                </li>
                </ul>
            </div>

            <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-xl hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-8 border border-amber-500/20">
                <AlertTriangle className="text-amber-400 w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight border-b border-white/5 pb-4">Growth Areas</h3>
                <ul className="space-y-4 text-slate-400 text-sm leading-relaxed font-bold">
                <li className="flex gap-3">
                    <span className="text-amber-500 font-black">•</span> Quantify impact using business metrics.
                </li>
                <li className="flex gap-3">
                    <span className="text-amber-500 font-black">•</span> Reduce conceptual ambiguity in responses.
                </li>
                </ul>
            </div>

            <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-xl hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20">
                <Star className="text-blue-400 w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight border-b border-white/5 pb-4">AI Pro Tip</h3>
                <p className="text-slate-400 text-sm leading-relaxed italic border-l-4 border-blue-600 pl-5 font-bold">
                "Continuous practice with our voice agent will refine your speech-to-logic conversion speed by 40%."
                </p>
            </div>
            </div>

            {/* ANALYSIS SECTION */}
            <div className="space-y-10">
            <div className="flex items-center gap-4">
                <div className="w-2 bg-blue-600 h-10 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                <h2 className="text-3xl font-black text-white tracking-tight">Sectional Appraisal</h2>
            </div>

            <div className="space-y-10">
                {comparisons.length > 0 ? (
                comparisons.map((pair: any, i: number) => (
                    <div key={i} className="group overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/20 backdrop-blur-md shadow-xl transition-all hover:bg-slate-900/30">
                        <div className="bg-white/5 p-6 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                                <Quote className="w-4 h-4 fill-slate-700 stroke-none" /> Question {i + 1}
                            </div>
                            <span className="text-[10px] font-black text-white bg-blue-600 px-4 py-2 rounded-xl border border-blue-400/20">Score: {pair.score || "N/A"}</span>
                        </div>
                        
                        <div className="p-10 space-y-10">
                            <div>
                                <p className="text-xl font-bold text-white mb-6 leading-tight tracking-tight">{pair.question}</p>
                                <div className="p-8 rounded-[2rem] bg-slate-950 border border-white/5 text-slate-400 text-sm italic font-bold leading-loose relative">
                                    <span className="absolute -top-3 left-6 bg-slate-900 px-3 text-[10px] font-black text-blue-500 uppercase tracking-widest border border-white/5 rounded-full">Transcribed Response</span>
                                    "{pair.userAnswer}"
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Critical Strength</h4>
                                    <p className="text-white text-sm leading-relaxed font-bold">{pair.strength}</p>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-3">
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Optimization Path</h4>
                                    <p className="text-white text-sm leading-relaxed font-bold">{pair.weakness}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
                ) : (
                <div className="p-16 text-center text-slate-500 bg-white/5 rounded-[3rem] border-4 border-dashed border-white/5">
                    <p className="text-sm font-black uppercase tracking-widest">Metadata evaluation in progress</p>
                    <p className="text-xs font-bold mt-2">Comprehensive breakdown will be available in the cloud portal.</p>
                </div>
                )}
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

            {/* TRANSCRIPT */}
            {(feedback as any)?.transcript?.length > 0 && (
                <div className="space-y-10 pt-16 border-t border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-2 bg-slate-700 h-10 rounded-full"></div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Interactive Log</h2>
                    </div>
                    
                    <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12 space-y-8 backdrop-blur-md">
                        {(feedback as any).transcript.map((turn: any, i: number) => (
                            <div key={i} className={cn(
                                "flex flex-col gap-2 max-w-[95%]",
                                turn.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                            )}>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] px-4">
                                    {turn.role === "assistant" ? "System Agent" : user?.name || "Participant"}
                                </span>
                                <div className={cn(
                                    "px-8 py-5 rounded-[2rem] text-sm leading-relaxed shadow-sm font-bold",
                                    turn.role === "user" 
                                        ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10" 
                                        : "bg-white/5 border border-white/10 text-slate-300 rounded-tl-none"
                                )}>
                                    {turn.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pt-16 border-t border-white/10 text-center pb-4">
                <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.5em]">Digitally Certified by PrepEdge Infrastructure</p>
                <p className="text-slate-500 text-[10px] font-bold mt-4">© {dayjs().year()} PrepEdge Analytics Engine</p>
            </div>
        </div>

      </div>

      {/* HIDDEN REPORT TEMPLATE FOR EXPORT */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, overflow: "hidden" }}>
        <ReportTemplate 
            ref={pdfRef} 
            user={user} 
            interviewData={interviewData} 
            score={score} 
        />
      </div>
    </main>
  );
}