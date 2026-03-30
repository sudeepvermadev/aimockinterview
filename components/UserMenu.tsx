"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/client";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User as UserIcon, Sparkles, LayoutDashboard, Settings, ChevronRight } from "lucide-react";

const UserMenu = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-10 w-10 animate-pulse bg-white/5 rounded-full border border-white/10" />;

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="px-6 py-2.5 rounded-2xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
      >
        Sign In
      </Link>
    );
  }

  const userInitial = user.email?.charAt(0).toUpperCase();

  return (
    <div className="relative">
      {/* --- Trigger: Small Circle Logo --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-[2px] rounded-full transition-all duration-300 active:scale-90 outline-none"
      >
        {/* Animated gradient border effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 blur-[2px] transition duration-500"></div>
        
        <div className="relative h-10 w-10 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#1e3a8a_0deg,#3b82f6_120deg,#2563eb_240deg,#1e3a8a_360deg)] flex items-center justify-center text-white font-bold text-base shadow-inner border border-white/20 overflow-hidden uppercase">
          {user.photoURL ? (
            <Image src={user.photoURL} alt="avatar" width={40} height={40} className="object-cover" />
          ) : (
            <span className="drop-shadow-md">{userInitial}</span>
          )}
        </div>
      </button>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <>
          {/* Overlay to close on click outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-4 w-80 bg-[#0d0d12] border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 overflow-hidden backdrop-blur-3xl animate-in fade-in zoom-in slide-in-from-top-2 duration-200 origin-top-right">
            
            {/* Header: Large Logo & Info */}
            <div className="flex flex-col items-center p-8 pb-6 bg-gradient-to-b from-blue-600/10 to-transparent">
                <div className="relative mb-4 group">
                    {/* Abstract Glow behind logo */}
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-3xl opacity-60"></div>
                    
                    {/* Large Logo with Sphere Effect */}
                    <div className="relative h-24 w-24 rounded-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-400 via-blue-700 to-indigo-950 flex items-center justify-center text-white font-extrabold text-4xl border-[5px] border-[#0d0d12] shadow-2xl uppercase tracking-tighter">
                       {user.photoURL ? (
                         <Image src={user.photoURL} alt="avatar" width={96} height={96} className="rounded-full object-cover" />
                       ) : (
                         <span className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{userInitial}</span>
                       )}
                    </div>
                </div>

                <div className="text-center w-full px-4">
                    <p className="text-xl font-bold text-white tracking-tight truncate">
                        {user.displayName || "User Account"}
                    </p>
                    <p className="text-sm text-gray-400 font-medium truncate mt-0.5 mb-4">
                        {user.email}
                    </p>
                    
                    <Link 
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-gray-200 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                    >
                      Manage Account <ChevronRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Menu Items */}
            <div className="p-3 space-y-1">
                <button className="w-full flex items-center gap-4 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-2xl transition-all group">
                  <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                    <LayoutDashboard size={18} className="text-blue-400" />
                  </div>
                  <span className="font-medium">Dashboard</span>
                </button>
                
                <button className="w-full flex items-center gap-4 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-2xl transition-all group">
                  <div className="p-2 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                    <Sparkles size={18} className="text-purple-400" />
                  </div>
                  <span className="font-medium">Mock Interviews</span>
                </button>

                <button className="w-full flex items-center gap-4 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-2xl transition-all group">
                  <div className="p-2 bg-gray-500/10 rounded-xl group-hover:bg-gray-500/20 transition-colors">
                    <Settings size={18} className="text-gray-400" />
                  </div>
                  <span className="font-medium">Settings</span>
                </button>
            </div>

            {/* Footer: Logout */}
            <div className="p-3 bg-white/[0.02] border-t border-white/5 mt-2">
              <button 
                onClick={() => {
                  signOut(auth);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold group"
              >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                Sign out
              </button>
            </div>
            
            <div className="py-3 text-center">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">PrepEdge Premium</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;