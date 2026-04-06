import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Mic, ChevronRight } from "lucide-react";
import Link from "next/link";

const ROLE_META: Record<string, { emoji: string; color: string; description: string }> = {
  "Frontend Developer":  { emoji: "🎨", color: "from-blue-500 to-cyan-500",    description: "HTML, CSS, React, TypeScript & UI frameworks" },
  "Full Stack Developer":{ emoji: "⚡", color: "from-purple-500 to-blue-500",  description: "Frontend + Backend, APIs, Databases & DevOps" },
  "Backend Engineer":    { emoji: "🛠️", color: "from-emerald-500 to-teal-500", description: "Python, Node.js, Databases, System Architecture" },
  "Mobile App Developer":{ emoji: "📱", color: "from-orange-500 to-pink-500",  description: "React Native, Swift, Kotlin & mobile UX" },
};

const Page = async ({ searchParams }: { searchParams: Promise<{ role?: string; type?: string }> }) => {
  const user = await getCurrentUser();
  const { role, type } = await searchParams;

  const agentRole = role || "Candidate";
  const agentType = type || "generate";
  const meta = ROLE_META[agentRole];

  return (
    <div className="min-h-screen">
      {/* Role-aware hero banner */}
      <div className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[#07070f]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6 font-medium">
            <Link href="/" className="hover:text-white/80 transition-colors text-white/60">Dashboard</Link>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="text-white/60">
              {role ? `${role} Interview` : "New Interview"}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-5">
              {/* Icon bubble */}
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${meta?.color || "from-blue-500 to-indigo-500"} flex items-center justify-center text-xl md:text-2xl shadow-lg flex-shrink-0`}>
                {meta?.emoji ?? <Mic className="w-5 h-5 md:w-6 md:w-6 text-white" />}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    {role ? `${role} Interview` : "Interview Generation"}
                  </h1>
                  {type && (
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest border
                      ${type === "Technical"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                      {type}
                    </span>
                  )}
                </div>
                {meta?.description && (
                  <p className="text-white/60 text-sm">{meta.description}</p>
                )}
              </div>
            </div>

            {/* Tips chip */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-300 text-sm font-medium">
              <Mic className="w-4 h-4 flex-shrink-0" />
              Speak naturally — Alex will guide you
            </div>
          </div>
        </div>
      </div>

      {/* Agent */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 py-6 md:py-10">
        <Agent
          userName={user?.name || agentRole}
          userId={user?.id}
          type={agentType}
          role={agentRole}
        />
      </div>
    </div>
  );
};

export default Page;