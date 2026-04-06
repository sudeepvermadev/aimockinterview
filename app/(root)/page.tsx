"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { Search, Plus, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getFeedbackByInterviewId, getTotalUserCount, getUserAnalytics } from "@/lib/actions/general.action";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { TrendingUp, Target, Zap } from "lucide-react";
import { dummyInterviews } from "@/constants";
import FAQ from "@/components/FAQ";
import UserReview from "@/components/UserReview";
import SocialLinks from "@/components/SocialLinks";
import TrustedBy from "@/components/TrustedBy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PrepStrategies from "@/components/PrepStrategies";
import AnimatedReviews from "@/components/AnimatedReviews";
import NumberCounter from "@/components/NumberCounter";
import { Users } from "lucide-react";


// ---- Fixed cover images for the "Take Interview" cards ----
const FIXED_COVERS = [
  "/covers/pinterest.png",
  "/covers/amazon.png",
  "/covers/spotify.png",
  "/covers/mobile.png",  // Mobile App Developer icon
];

export default function Page() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [allInterviews, setAllInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        setUser(user);
        
        const userCount = await getTotalUserCount();
        setTotalUsers(userCount);

        if (!user) { setAllInterviews([]); setLoading(false); return; }

        const serverInterviews = await getInterviewsByUserId(user.id) || [];

        const finalizedData = await Promise.all(
          serverInterviews.map(async (interview: any) => {
            const feedback = await getFeedbackByInterviewId({ interviewId: interview.id, userId: user.id });
            return { ...interview, feedback: feedback || null };
          })
        );
        setAllInterviews(finalizedData);

        const analytics = await getUserAnalytics(user.id);
        setAnalyticsData(analytics);
      } catch (err) {
        console.error("Error syncing data:", err);
        setAllInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredInterviews = allInterviews.filter((interview: any) =>
    interview?.role?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] bg-gradient-to-br from-[#0a0a10] via-[#0c0c16] to-[#0a0a10] flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl" />

        <div className="w-[85%] max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 z-10">
          {/* Text */}
          <div className="flex flex-col gap-6 max-w-xl">
            {/* Social Proof Badge */}
            <div className="flex items-center gap-3 w-fit px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2 animate-fadeIn">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 99}`}
                    alt="User"
                    className="w-6 h-6 rounded-full border-2 border-slate-900"
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-white/80 uppercase tracking-widest">
                Trusted by <span className="text-blue-400"><NumberCounter value={totalUsers} />+</span> Ambitious Users
              </p>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
              Get Interview-Ready with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                AI-Powered Practice
              </span>
            </h1>
            <p className="text-lg text-white/80">
              Practice real interview questions, get instant feedback, and boost your confidence.
            </p>
            <div className="flex gap-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-lg rounded-xl shadow-lg text-white">
                <Link href="/interview">Start Interview</Link>
              </Button>
            </div>
          </div>

          {/* Robot */}
          <div className="hidden md:flex justify-center items-center">
            <Image src="/robot.png" alt="AI Robot" width={400} height={400} priority />
          </div>
        </div>
      </section>

      {/* ── TAKE INTERVIEW ───────────────────────────────────── */}
      <section id="take-interview" className="py-20 px-6 relative overflow-hidden border-t border-[var(--border-subtle)]">
        <div className="absolute top-[5%]  left-[5%]  w-[35%] h-[60%] bg-blue-600/8  blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[0%] right-[5%] w-[25%] h-[50%] bg-purple-600/8 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
              Take <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Interview</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-sm font-medium">
              Select a role-based template and launch an AI-driven mock interview tailored to you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dummyInterviews.slice(0, 4).map((dummy, idx) => (
              <InterviewCard
                key={dummy.id}
                {...dummy}
                coverImage={FIXED_COVERS[idx]}
                customHref={`/interview?role=${encodeURIComponent(dummy.role)}&type=${encodeURIComponent(dummy.type)}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── PERFORMANCE OVERVIEW (Only for logged in users with data) ── */}
      {user && analyticsData && analyticsData.totalInterviews > 0 && (
        <section id="analytics-summary" className="py-20 px-6 border-t border-[var(--border-subtle)] relative overflow-hidden">
          <div className="absolute top-[20%] right-[0%] w-[30%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="w-full max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
                  Performance <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Overview</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-sm font-medium">
                  Quick look at your interview readiness and skill growth.
                </p>
              </div>
              <Button asChild variant="outline" className="border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-card-alt)] text-[var(--text-primary)] rounded-xl px-6 transition-all hover:scale-105 active:scale-95 shadow-sm">
                <Link href="/dashboard">View Full Analytics</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Score Trend */}
              <Card className="bg-[var(--surface-card)] border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden shadow-xl transition-colors duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    Growth Trajectory
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.scoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                      <XAxis dataKey="date" stroke={theme === 'dark' ? "#9ca3af" : "#64748b"} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={theme === 'dark' ? "#9ca3af" : "#64748b"} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[0, 50, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#11111d' : '#ffffff', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#3b82f6' }} />
                      <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 3, stroke: theme === 'dark' ? '#fff' : '#000' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Skill Radar */}
              <Card className="bg-[var(--surface-card)] border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden shadow-xl transition-colors duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    Core Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="80%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData.skillBreakdown}>
                      <PolarGrid stroke={theme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#64748b', fontSize: 9 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="User" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* ── YOUR INTERVIEWS ──────────────────────────────────── */}
      <section id="history" className="py-20 px-6 border-t border-[var(--border-subtle)]">
        <div className="w-full max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-1">
                Your <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Interviews</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Review past sessions and track your growth.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search by role…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                  suppressHydrationWarning
                />
              </div>

              {/* New Interview button */}
              <Link 
                href="/interview" 
                className="relative group p-3 bg-blue-600 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 flex-shrink-0"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
                <Plus className="w-5 h-5 text-white relative" />
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 rounded-[28px] bg-white/[0.02] border border-[var(--border-subtle)] animate-pulse" />
              ))}
            </div>
          ) : filteredInterviews.length > 0 ? (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInterviews.slice(0, visibleCount).map((interview: any) => (
                  <InterviewCard key={interview.id} {...interview} />
                ))}
              </div>
              
              {filteredInterviews.length > visibleCount && (
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setVisibleCount(prev => prev + 4)}
                    variant="outline" 
                    className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl px-10 h-14 font-bold transition-all hover:scale-105"
                  >
                    Load More Interviews
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01]">
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-6">
                <Mic className="w-9 h-9 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                {searchTerm ? `No results for "${searchTerm}"` : "No Interviews Yet"}
              </h3>
              <p className="text-[var(--text-secondary)] max-w-sm mb-8 leading-relaxed">
                {searchTerm
                  ? "Try a different search term or start a fresh interview."
                  : "You haven't taken any mock interviews yet. Pick a role above or start a custom session now."}
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-11 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                <Link href="/interview">Start Your First Interview</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <FAQ />

      {/* ── PREP STRATEGIES ─────────────────────────────────── */}
      <PrepStrategies />

      {/* ── REVIEWS ────────────────────────────────────────── */}
      <UserReview 
        userId={user?.id} 
        username={user?.name || "User"} 
        totalUsers={totalUsers} 
      />

      {/* ── ANIMATED REVIEWS ─────────────────────────────────── */}
      <AnimatedReviews />

      {/* ── TRUSTED BY ─────────────────────────────────────── */}
      <TrustedBy />

      {/* ── SOCIALS ────────────────────────────────────────── */}
      <SocialLinks />
    </div>
  );
}