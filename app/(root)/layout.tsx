import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getStreakHistory } from "@/lib/actions/general.action";
import StreakBadge from "@/components/StreakBadge";

const MainLayout = async ({ children, modal }: { children: React.ReactNode, modal: React.ReactNode }) => {
  const user = await getCurrentUser();
  const streak = (user as any)?.streakCount || 0;
  const history = user ? await getStreakHistory(user.id) : [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky frosted-glass header */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--surface-header)] backdrop-blur-xl">
        <nav className="w-[92%] max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-1 bg-white/10 rounded-xl transition-all duration-300 group-hover:bg-blue-500/20">
                <Image
                  src="/logonew.png"
                  alt="logo"
                  height={30}
                  width={26}
                  style={{ height: "auto", width: "auto" }}
                  className="p-1 bg-gray-50 rounded-xl transition-all duration-300 group-hover:bg-blue-50 group-hover:-translate-y-0.5"
                />
              </div>
              <span className="text-[var(--text-primary)] font-bold text-2xl tracking-tight">
                Prep<span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Edge</span>
              </span>
            </Link>

          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Streak Feature */}
            {user && (
              <div className="hidden sm:flex transition-all duration-300 transform animate-fadeIn">
                <StreakBadge streak={streak} history={history} />
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            <UserMenu />
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>

      <Footer />
      {modal}
    </div>
  );
};

export default MainLayout;