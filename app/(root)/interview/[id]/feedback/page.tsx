"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Download, 
  AlertTriangle, 
  MessageSquare, 
  ArrowLeft,
  CheckCircle,
  Activity,
  ArrowRight,
  TrendingUp,
  Award,
  Share2,
  Globe,
  Lock,
  Lightbulb,
  Zap,
  Quote,
  Trophy,
  Target,
  Users,
  Brain,
  ShieldCheck,
  Twitter,
  Linkedin as LinkedinIcon,
  MessageCircle,
  Send,
  Instagram as InstagramIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getInterviewById, getFeedbackByInterviewId, toggleFeedbackVisibility, updateFeedbackScore } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import { cn, extractScoreFromText } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReportTemplate from "@/components/ReportTemplate";

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const pdfRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Calculate score with useMemo to keep it stable and always before returns
  const scoreData = useMemo(() => {
    if (!interviewData?.feedback) return { score: 0, transcript: [], comparisons: [] };
    
    const feedback = interviewData.feedback;
    const transcript = feedback.transcript || [];
    const comparisons = feedback.comparisons || [];
    
    let currentScore = feedback.totalScore || 0;
    if (currentScore === 0 && transcript.length > 0) {
        const transcriptText = transcript.map((t: any) => t.content).join(" ");
        currentScore = extractScoreFromText(transcriptText);
    }
    
    return { score: currentScore, transcript, comparisons };
  }, [interviewData]);

  const { score, transcript, comparisons } = scoreData;

  // 2. Sync Effect (MUST BE BEFORE EARLY RETURNS)
  useEffect(() => {
    const shouldSync = !loading && 
                       interviewData?.feedback?.id && 
                       score > 0 && 
                       (interviewData.feedback.totalScore === 0 || !interviewData.feedback.totalScore);

    if (shouldSync) {
      const syncScore = async () => {
        try {
          const res = await updateFeedbackScore(interviewData.feedback.id, score);
          if (res.success) {
            console.log("📊 Score synced to database successfully.");
            setInterviewData((prev: any) => ({
              ...prev,
              feedback: {
                ...prev.feedback,
                totalScore: score
              }
            }));
          }
        } catch (err) {
          console.error("Failed to sync score:", err);
        }
      };
      syncScore();
    }
  }, [loading, interviewData?.feedback?.id, interviewData?.feedback?.totalScore, score]);

  const shareText = "I just finished my mock interview on PrepEdge! 🚀 Check out my performance analysis.";
  
  const getShareUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
    return `${baseUrl}/feedback/share/${interviewData?.feedback?.id}`;
  };

  const socialShares = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366]",
      link: () => `https://wa.me/?text=${encodeURIComponent(shareText + " " + getShareUrl())}`,
    },
    {
      name: "LinkedIn",
      icon: LinkedinIcon,
      color: "bg-[#0077B5]",
      link: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`,
    },
    {
      name: "X",
      icon: Twitter,
      color: "bg-[#000000]",
      link: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#0088CC]",
      link: () => `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Instagram",
      icon: InstagramIcon,
      color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
      link: () => `https://www.instagram.com/`, 
    }
  ];

  const downloadPdf = async () => {
    if (!pdfRef.current) return;
    const toastId = toast.loading("Preparing your high-resolution report...");
    setIsExporting(true);
    try {
      const element = pdfRef.current;
      const wrapper = element.parentElement as HTMLElement;
      wrapper.style.position = "absolute"; wrapper.style.left = "0"; wrapper.style.top = "0";
      wrapper.style.zIndex = "-1"; wrapper.style.opacity = "0"; wrapper.style.overflow = "visible";
      
      const images = element.querySelectorAll("img");
      await Promise.all(Array.from(images).map(img => new Promise<void>(resolve => {
        if (img.complete) return resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve();
      })));

      await new Promise((r) => setTimeout(r, 500));
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: "#FFFFFF", windowWidth: 1024 });
      wrapper.style.position = "fixed"; wrapper.style.left = "-9999px"; wrapper.style.overflow = "hidden";
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const margin = 15;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      let heightLeft = contentHeight;
      let position = margin;

      pdf.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= usableHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (contentHeight - heightLeft);
        pdf.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight, undefined, 'FAST');
        heightLeft -= usableHeight;
      }
      
      pdf.save(`PrepEdge-Evaluation-${user?.name?.replace(/\s+/g, "-") || "Candidate"}.pdf`);
      toast.success("Intelligence Report downloaded successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to generate PDF.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) { router.push("/sign-in"); return; }
        setUser(currentUser);
        const serverInterview = await getInterviewById(id);
        const serverFeedback: any = await getFeedbackByInterviewId({ interviewId: id, userId: currentUser.id });
        if (serverInterview) {
          setInterviewData({ ...serverInterview, feedback: serverFeedback });
          setIsPublic(serverFeedback?.isPublic || false);
        } else { router.push("/"); }
      } catch (error) { router.push("/"); }
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
      if (res.success) { setIsPublic(nextPublic); toast.success(nextPublic ? "Public!" : "Private."); }
    } catch (err) { toast.error("Error."); }
    finally { setSharing(false); }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopiedLink(true);
    toast.success("Copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-base)]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 scale-110"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  if (!interviewData) return null;

  const { role, createdAt } = interviewData;
  const numQuestions = comparisons.length > 0 ? comparisons.length : transcript.filter((m: any) => m.role === 'assistant').length;
  const weightPerQuestion = numQuestions > 0 ? Math.max(1, Math.floor(100 / numQuestions)) : 0;
  const correctCount = comparisons.length > 0 ? comparisons.filter((c: any) => (c.marksAwarded ?? c.score ?? 0) >= (weightPerQuestion * 0.7)).length : Math.floor(numQuestions * (score / 100));
  const avgAccuracy = score;

  return (
    <main className="min-h-screen bg-[var(--surface-base)] selection:bg-blue-500/30 pb-20 relative overflow-hidden font-sans">
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center bg-[var(--surface-header)] backdrop-blur-2xl border-b border-[var(--border-subtle)] sticky top-0 rounded-b-[2.5rem] shadow-2xl">
        <Link href="/" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all group font-black text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Analytics Hub
        </Link>
        <div className="flex gap-4">
            <Button onClick={handleTogglePublic} disabled={sharing} variant="outline" className={cn("rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest border-white/5 transition-all shadow-xl", isPublic ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[var(--surface-card-alt)]")}>
              {sharing ? "..." : isPublic ? "Public" : "Private"}
            </Button>
            {isPublic && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-[var(--surface-card-alt)] hover:bg-[var(--surface-card)] text-[var(--text-primary)] border-[var(--border-subtle)] rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 shadow-xl active:scale-95 transition-all">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[var(--surface-card)]/90 border-[var(--border-primary)] rounded-3xl shadow-2xl p-2 backdrop-blur-xl z-[100]">
                   {socialShares.map((social) => (
                      <DropdownMenuItem key={social.name} asChild className="rounded-2xl focus:bg-blue-500/10 focus:text-blue-500 cursor-pointer p-2.5 transition-colors mb-1 last:mb-0 group">
                        <a href={social.link()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full">
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", social.color)}>
                            <social.icon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-widest">{social.name}</span>
                        </a>
                      </DropdownMenuItem>
                   ))}
                   <div className="h-px bg-[var(--border-subtle)] my-1.5 mx-2" />
                   <DropdownMenuItem onClick={copyShareLink} className="rounded-2xl focus:bg-blue-500/10 focus:text-blue-500 cursor-pointer p-2.5 transition-colors group">
                      <div className="w-9 h-9 bg-[var(--surface-card-alt)] rounded-xl flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md transition-transform group-hover:scale-110">
                        {copiedLink ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-xs uppercase tracking-widest ml-3">{copiedLink ? "Copied!" : "Copy Link"}</span>
                   </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button onClick={downloadPdf} disabled={isExporting} className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl px-8 font-black text-[10px] uppercase tracking-widest">
                {isExporting ? "Processing..." : "Export Report"}
            </Button>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-16 space-y-20">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-12 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-6">
                <div className="p-4 bg-[var(--surface-card)] rounded-3xl border border-[var(--border-primary)] shadow-2xl backdrop-blur-md">
                    <Image src="/logonew.png" alt="Logo" height={60} width={60} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">Prep<span className="text-blue-500">Edge</span></h2>
                    <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-[0.3em] mt-3">Intelligence Appraisal</p>
                </div>
            </div>
            <div className="flex flex-col md:items-end text-left md:text-right">
                <div className="flex items-center gap-3 md:justify-end">
                    <p className="text-3xl font-black text-[var(--text-primary)] leading-none tracking-tight">{user?.name || "Candidate"}</p>
                    {user?.isPro && (
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-600 text-[10px] font-black text-white rounded-lg uppercase tracking-widest shadow-lg shadow-amber-500/20">
                           PRO
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-4 text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
                    <span>{role} Interview</span> <span className="w-1 h-1 bg-[var(--border-primary)] rounded-full" /> <span>{dayjs(createdAt).format("MMM DD, YYYY")}</span>
                </div>
            </div>
        </motion.div>

        {/* PERFORMANCE MATRIX */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 relative group max-w-5xl mx-auto">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/10 via-emerald-600/10 to-purple-600/10 blur-2xl opacity-40 rounded-[3rem]" />
            <div className="relative bg-[var(--surface-card)]/70 backdrop-blur-2xl p-8 md:p-10 rounded-[3rem] border border-[var(--border-primary)] shadow-xl flex flex-col md:flex-row items-center justify-center gap-10 overflow-hidden">
                <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-[var(--border-subtle)] opacity-10" />
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={553} strokeDashoffset={553 - (553 * score) / 100} strokeLinecap="round" className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em] mb-1">Index</span>
                        <span className="text-6xl font-black text-[var(--text-primary)] tracking-tighter leading-none">{score}</span>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Score</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
                    <div className="bg-[var(--surface-card-alt)]/30 p-6 rounded-[2rem] border border-[var(--border-subtle)] flex flex-col items-center justify-center text-center group/card transition-all">
                        <Target className="w-6 h-6 text-emerald-400 mb-3" />
                        <span className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{avgAccuracy}%</span>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">Accuracy</span>
                    </div>
                    <div className="bg-[var(--surface-card-alt)]/30 p-6 rounded-[2rem] border border-[var(--border-subtle)] flex flex-col items-center justify-center text-center group/card transition-all">
                        <Activity className="w-6 h-6 text-blue-400 mb-3" />
                        <span className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{correctCount}/{numQuestions}</span>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">Segments</span>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* LOGS SECTION */}
        <div className="space-y-16">
            <div className="flex items-center gap-6 border-b border-[var(--border-subtle)] pb-8">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Appraisal Log</h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border-primary)] to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-14">
                {comparisons.map((pair: any, i: number) => {
                    const percentage = Math.round(((pair.marksAwarded ?? pair.score ?? 0) / weightPerQuestion) * 100) || 0;
                    const accent = percentage >= 80 ? "emerald" : percentage >= 50 ? "amber" : "rose";
                    return (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="group space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="space-y-3 max-w-2xl">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] block mb-2">Question 0{i + 1}</span>
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{pair.question}</h3>
                                </div>
                                <div className="shrink-0 bg-[var(--surface-card)]/60 p-6 rounded-[2.5rem] border border-[var(--border-primary)] min-w-[140px] text-center">
                                    <div className={cn("text-4xl font-black tracking-tighter", `text-${accent}-500`)}>{percentage}%</div>
                                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Match</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-[var(--surface-card)]/40 p-10 rounded-[3rem] border border-[var(--border-primary)] group/card hover:bg-[var(--surface-card-alt)] transition-all">
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-6">Your Answer</span>
                                    <p className="text-[var(--text-secondary)] text-lg font-medium italic leading-relaxed">&quot;{pair.userResponse}&quot;</p>
                                </div>
                                <div className="bg-emerald-500/5 p-10 rounded-[3rem] border border-emerald-500/10 group/card hover:bg-emerald-500/10 transition-all">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-6">AI Answer</span>
                                    <p className="text-emerald-900 dark:text-emerald-100/90 text-lg font-bold leading-relaxed">{pair.correctAnswer}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {comparisons.length === 0 && transcript.length > 0 && (
                    <div className="bg-[var(--surface-card)]/40 rounded-[3.5rem] border border-[var(--border-primary)] p-10 shadow-2xl">
                        <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em] mb-10">Captured Interview Transcript</h3>
                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
                            {transcript.map((m: any, idx: number) => (
                                <div key={idx} className={cn("p-8 rounded-[2.5rem] border transition-all duration-500", m.role === 'assistant' ? "bg-blue-600/5 border-blue-500/10 mr-12" : "bg-[var(--surface-card-alt)] border-[var(--border-subtle)] ml-12")}>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-3">{m.role === 'assistant' ? 'Alex (AI Coach)' : (user?.name || 'Candidate')}</span>
                                    <p className={cn("text-base leading-relaxed", m.role === 'assistant' ? "text-blue-500 font-bold" : "text-[var(--text-primary)] font-medium")}>{m.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* SOCIAL SHARING */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="pt-20">
            <div className="bg-[var(--surface-card)] rounded-[4rem] border border-[var(--border-primary)] p-12 text-center shadow-2xl">
                <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Share Achievement</h3>
                <h4 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-8">Spread your professional edge</h4>
                <div className="flex flex-wrap justify-center gap-6">
                    {socialShares.map((social) => (
                        <a key={social.name} href={social.link()} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 transition-all">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all group-hover:scale-110", social.color)}>
                                <social.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{social.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </motion.div>

        <div className="pt-32 border-t border-[var(--border-subtle)] text-center pb-12 opacity-40">
            <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.6em] mb-4">Digitally Certified by PrepEdge Infrastructure</p>
            <p className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase">ECC-824 Protocol Verified Assessment</p>
            <p className="text-[var(--text-muted)] text-[10px] font-bold mt-4">© {dayjs().year()} PrepEdge Analytics</p>
        </div>
      </div>

      <div style={{ position: "fixed", left: "-9999px", top: 0, overflow: "hidden" }}>
        <ReportTemplate ref={pdfRef} user={user} interviewData={interviewData} score={score} />
      </div>
    </main>
  );
}