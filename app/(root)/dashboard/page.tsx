"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { TrendingUp, Award, Zap, Target, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserAnalytics } from "@/lib/actions/general.action";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const u = await getCurrentUser();
        setUser(u);
        if (u) {
          const analytics = await getUserAnalytics(u.id);
          setData(analytics);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-base)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] font-medium animate-pulse">Loading your insights...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-base)] px-6">
        <div className="text-center max-w-md p-10 bg-[var(--surface-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-2xl">
          <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Unlock Your Dashboard</h2>
          <p className="text-[var(--text-secondary)] mb-8">Sign in to track your progress, see detailed skill breakdowns, and shared your success with the world.</p>
          <Button asChild className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            <Link href="/sign-in">Get Started Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-base)] pb-20 pt-10">
      <div className="w-[92%] max-w-7xl mx-auto space-y-8">

        {/* Navigation */}
        <div className="flex justify-start">
          <Button 
            asChild 
            variant="outline" 
            className="bg-black border-black text-white hover:bg-gray-800 hover:text-white dark:bg-[var(--surface-card)] dark:border-[var(--border-subtle)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--surface-card-alt)] rounded-xl px-5 h-10 transition-all hover:-translate-x-1 active:scale-95 shadow-lg dark:shadow-sm"
          >
            <Link href="/" className="flex items-center gap-2 font-bold">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              Career Performance
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Hello, <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">{user.name.split(' ')[0]}!</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
              Here's a detailed look at your interview readiness and growth over time.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 h-12 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
              <Link href="/interview" className="flex items-center gap-2">
                Start New Practice <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Interviews"
            value={data?.totalInterviews || 0}
            icon={<Target className="text-blue-400" />}
            description={`${data?.completedInterviews || 0} sessions completed`}
          />
          <StatCard
            title="Highest Score"
            value={`${data?.highestScore || 0}%`}
            icon={<Award className="text-yellow-400" />}
            description="Personal record"
          />
          <StatCard
            title="Average Score"
            value={`${data?.averageScore || 0}%`}
            icon={<TrendingUp className="text-green-400" />}
            description="Overall performance"
          />
        </div>

        {/* Charts Section */}
        {data?.totalInterviews > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Score Trend - Line Chart */}
            <Card className="bg-[var(--surface-card)] border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  Performance Trend
                </CardTitle>
                <CardDescription>How your overall score has evolved over your last interviews.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#11111d] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{data.date}</p>
                              <p className="text-sm font-bold text-white mb-2">{data.role}</p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <p className="text-xl font-black text-blue-400">{data.score}%</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skill Breakdown - Radar Chart */}
            <Card className="bg-[var(--surface-card)] border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  Skill Analysis
                </CardTitle>
                <CardDescription>Comprehensive breakdown of your core strengths across all sessions.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="85%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.skillBreakdown}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="User"
                      dataKey="A"
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#11111d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        ) : (
          /* Empty state for data */
          <div className="py-20 text-center rounded-[3rem] bg-white/[0.01] border border-dashed border-[var(--border-subtle)] flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400">
              <Zap className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No Analytics Collected Yet</h3>
              <p className="text-[var(--text-secondary)] max-w-sm mx-auto">Complete your first AI mock interview to unlock detailed performance tracking and insights.</p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-8 h-12 transition-all hover:scale-105 active:scale-95">
              <Link href="/interview">Launch First Interview</Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description }: any) {
  return (
    <Card className="bg-[var(--surface-card)] border-[var(--border-subtle)] rounded-[2.5rem] p-6 group hover:border-blue-500/30 transition-all duration-300 shadow-xl">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">{title}</p>
          <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-4xl font-black text-[var(--text-primary)]">{value}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium italic">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
