"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Plus, Video, Sparkles } from "lucide-react"; // Using Lucide for clean icons
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { dummyInterviews } from "@/constants";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allInterviews, setAllInterviews] = useState(dummyInterviews);

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem("mock_interviews") || "[]");
      // Deduplicate by ID to prevent React key warnings
      const combined = [...local, ...dummyInterviews];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setAllInterviews(unique);
    } catch (err) {
      console.error("Error reading localStorage", err);
    }
  }, []);

  // Search logic
  const filteredInterviews = allInterviews.filter((interview: any) =>
    interview.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#0a0a10] text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[75vh] bg-gradient-to-br from-[#0a0a10] via-[#0c0c16] to-[#0a0a10] flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl"></div>

        <div className="w-[85%] max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 z-10">
          <div className="flex flex-col gap-6 max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Get Interview-Ready with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                AI-Powered Practice
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Practice real interview questions, get instant feedback, and boost your confidence.
            </p>
            <div className="flex gap-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-lg rounded-xl shadow-lg">
                <Link href="/interview">Start Interview</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <Image src="/robot.png" alt="AI Robot" width={400} height={400} />
          </div>
        </div>
      </section>

      {/* --- YOUR INTERVIEWS SECTION --- */}
      <section className="bg-[#0a0a10] py-20 flex flex-col items-center px-6">
        
        {/* HEADER AREA */}
        <div className="w-full max-w-7xl mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left Side: Title & Shimmer Line */}
            <div className="relative group">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Your <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Interviews</span>
              </h2>
              
              <div className="relative mt-3 h-[2px] w-full max-w-[200px] bg-gray-800 overflow-hidden rounded-full">
                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer" 
                     style={{ backgroundSize: '200% 100%' }}>
                </div>
              </div>
              
              <p className="text-gray-500 mt-4 font-medium text-sm">
                Review your past sessions and track growth.
              </p>
            </div>

            {/* Right Side: Search & Icon Button */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Icon-Only Action Button (New Interview) */}
              <Link href="/interview" className="relative group p-3 bg-blue-600 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative flex items-center justify-center text-white">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                
                {/* Tooltip */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-[10px] text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                  New Interview
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        {/* INTERVIEW GRID */}
        <div className="w-full max-w-7xl flex flex-wrap gap-8 justify-center">
          {filteredInterviews.length > 0 ? (
            filteredInterviews.map((interview) => (
              <InterviewCard key={interview.id} {...interview} />
            ))
          ) : (
            <div className="py-20 text-center w-full">
              <p className="text-gray-600 italic">No interviews found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}