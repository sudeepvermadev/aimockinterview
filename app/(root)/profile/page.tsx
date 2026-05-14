import React from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getUserAnalytics } from "@/lib/actions/general.action";

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, User as UserIcon, Calendar,
  Shield, Activity, BarChart3, Mic, Settings2, Medal, Bell
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { BADGES } from "@/constants/achievements";
import BadgeCard from "@/components/BadgeCard";
import ProfileAvatar from "@/components/ProfileAvatar";
import ShareProfile from "@/components/ShareProfile";
import WalletCard from "@/components/WalletCard";
import { Wallet } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Fetch real data
  const analytics = await getUserAnalytics(user.id);
  const interviews = await getInterviewsByUserId(user.id) || [];
  
  // Use analytics as the source of truth for counts to match dashboard
  const totalInterviews = analytics?.totalInterviews || interviews.length;
  const completedInterviews = analytics?.completedInterviews || interviews.filter((i: any) => i.finalized).length;

  const userInitial = (user as any).name?.charAt(0).toUpperCase()
    || (user as any).email?.charAt(0).toUpperCase()
    || "U";

  const displayName = (user as any).name || (user as any).email?.split("@")[0] || "User";

  // Format member since date
  const rawCreatedAt = (user as any).createdAt;
  const memberSince = rawCreatedAt
    ? new Date(rawCreatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Early Member";

  const STATS = [
    { icon: Mic,      value: String(totalInterviews),    label: "Total Interviews",     color: "blue"    },
    { icon: BarChart3, value: String(completedInterviews), label: "Completed",           color: "emerald" },
    { icon: Activity, value: totalInterviews > 0 ? "Active" : "New", label: "Status",  color: "purple"  },
  ];

  return (
    <main className="min-h-screen pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-50 max-w-5xl mx-auto px-6 pt-8 pb-4 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group font-medium shrink-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">

          <ShareProfile 
            user={{
              name: displayName,
              email: (user as any).email,
              photoURL: (user as any).photoURL,
              streakCount: (user as any).streakCount || 0,
              initial: userInitial,
              isPro: (user as any).isPro
            }} 
            stats={{
              totalInterviews,
              averageScore: analytics?.averageScore || 0,
              badgeCount: (user as any).badges?.length || 0
            }}
          />
          {user.email === "sudeepverma2006@gmail.com" && (
            <Link 
              href="/admin/transactions" 
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-full font-black text-[10px] uppercase tracking-wider hover:bg-purple-600/20 transition-all"
            >
              <Shield className="w-3 h-3" /> Admin Dashboard
            </Link>
          )}
          <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            Profile
          </div>
        </div>
      </nav>


      <div className="relative z-10 max-w-5xl mx-auto px-6 mt-4 space-y-6">

        {/* ── Profile Header Card ─────────────────────────── */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

          {/* Avatar (Interactive Upload) */}
          <ProfileAvatar 
            userId={user.id} 
            initialPhotoUrl={(user as any).photoURL} 
            userInitial={userInitial} 
            isPro={(user as any).isPro}
          />


          {/* Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 mt-2 z-10">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {displayName}
              </h1>
              {(user as any).isPro && (
                <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-600 text-[10px] font-black text-white rounded-lg uppercase tracking-widest shadow-lg shadow-amber-500/20">
                   PRO
                </span>
              )}
            </div>

            <p className="text-blue-400 text-base font-medium mb-6">PrepEdge Candidate</p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-secondary)]">
                <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                {(user as any).email}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-400">
                <Shield className="w-4 h-4" />
                Verified Account
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-secondary)]">
                <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
                Member since {memberSince}
              </div>
              </div>
            </div>
          </div>


        {/* ── Stats Row ───────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {STATS.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className={`bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[1.5rem] p-6 flex flex-col items-center text-center hover:border-${color}-500/20 transition-colors`}>
              <Icon className={`w-6 h-6 text-${color}-400 mb-3`} />
              <span className="text-3xl font-extrabold text-[var(--text-primary)] mb-1">{value}</span>
              <span className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Wallet & Subscription ────────────────────────── */}
        <div className="space-y-6">
           <div className="flex items-center gap-4 ml-2">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                 <Wallet className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Wallet & Subscription</h2>
           </div>
           <WalletCard user={{ ...user, id: user.id }} />
        </div>

        {/* ── Info Grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Personal Info & Settings */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2rem] p-8 hover:border-[var(--border-primary)] transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <UserIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Personal Info</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Full Name",      value: displayName },
                  { label: "Email Address",  value: (user as any).email },
                  { label: "Member Since",   value: memberSince },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{label}</span>
                    <p className="text-[var(--text-secondary)] font-medium mt-0.5">{value}</p>
                    <div className="h-px w-full bg-[var(--border-subtle)] mt-3" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2rem] p-8 hover:border-[var(--border-primary)] transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-500/10 rounded-2xl">
                  <Settings2 className="w-6 h-6 text-[var(--text-secondary)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">App Settings</h2>
              </div>
              
              <div className="space-y-6">
                <Link href="/notifications" className="flex items-center justify-between group hover:bg-[var(--surface-base)] -mx-3 px-3 py-2 rounded-xl transition-all">
                  <div>
                    <h3 className="text-[var(--text-primary)] font-medium text-base group-hover:text-blue-400 transition-colors">Notifications</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      View all your alerts & reminders.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-500/10 rounded-xl">
                      <Bell className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                </Link>

                <div className="h-px w-full bg-[var(--border-subtle)]" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[var(--text-primary)] font-medium text-base">Appearance</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      Toggle Light/Dark.
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>

          {/* Achievements & Activity */}
          <div className="lg:col-span-2 space-y-6">
             {/* ── ACHIEVEMENTS ── */}
             <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2rem] p-8 hover:border-[var(--border-primary)] transition-colors">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-2xl">
                      <Medal className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">Achievements</h2>
                      <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-black mt-1">
                        {(user as any).badges?.length || 0} / {BADGES.length} Unlocked
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {BADGES.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      {...badge}
                      unlocked={(user as any).badges?.includes(badge.id)}
                    />
                  ))}
                </div>
             </div>

            {/* Activity Overview */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2rem] p-8 hover:border-[var(--border-primary)] transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-2xl">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Activity Overview</h2>
              </div>

              {totalInterviews > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)] text-sm">Total Sessions</span>
                    <span className="text-[var(--text-primary)] font-bold">{totalInterviews}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)] text-sm">Completed</span>
                    <span className="text-emerald-400 font-bold">{completedInterviews}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[var(--text-secondary)] text-sm">In Progress</span>
                    <span className="text-blue-400 font-bold">{totalInterviews - completedInterviews}</span>
                  </div>
                  <Link href="/" className="mt-2 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors">
                    View all interviews →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-[var(--empty-state-bg)] border border-dashed border-[var(--border-subtle)] rounded-2xl">
                  <Mic className="w-8 h-8 text-[var(--text-muted)] mb-3" />
                  <p className="text-[var(--text-secondary)] font-medium mb-3">No interviews yet.</p>
                  <Link href="/interview" className="text-blue-400 hover:text-blue-300 font-semibold text-sm">
                    Start your first one →
                  </Link>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>

    </main>
  );
}
