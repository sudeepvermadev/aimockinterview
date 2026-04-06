"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/firebase/client";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User as UserIcon, Sparkles, LayoutDashboard, Settings, ChevronRight, X, Trash2, AlertTriangle, Loader2, Calendar, Bell } from "lucide-react";
import { deleteUserAccount, getCurrentUser } from "@/lib/actions/auth.action";
import { getUnreadNotificationCount } from "@/lib/actions/notifications.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

const UserMenu = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const data = await getCurrentUser();
          setUserData(data);
          // Fetch notification count
          const count = await getUnreadNotificationCount();
          setUnreadCount(count);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
        setUnreadCount(0);
      }
      setLoading(false);
    });
    return () => {
        unsubscribe();
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
        setIsOpen(false);
        setShowDeleteConfirm(false);
    }, 300);
  };

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

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const result = await deleteUserAccount(user.uid);
      if (result.success) {
        toast.success("Account deleted. We're sorry to see you go.");
        setShowDeleteConfirm(false);
        setIsOpen(false);
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete account. Try signing out and back in first.");
      }
    } catch (error) {
      console.error("Deletion Error:", error);
      toast.error("An error occurred during account deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
      setShowDeleteConfirm(false);
      toast.success("Signed out successfully.");
      router.refresh();
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const menuVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      filter: "blur(10px)"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        duration: 0.4,
        bounce: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      filter: "blur(10px)",
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    >
      {/* --- Trigger: Small Circle Logo --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-[2px] rounded-full transition-all duration-300 active:scale-90 outline-none"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 blur-[2px] transition duration-500"></div>
        
        <div className="relative h-10 w-10 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#1e3a8a_0deg,#3b82f6_120deg,#2563eb_240deg,#1e3a8a_360deg)] flex items-center justify-center text-white font-bold text-base shadow-inner border border-white/20 overflow-hidden uppercase">
            {user.photoURL ? (
                <Image 
                src={user.photoURL} 
                alt="avatar" 
                width={40} 
                height={40} 
                className="object-cover" 
                />
            ) : (
                <span>{userInitial}</span>
            )}
        </div>

        {/* Global Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 border-2 border-[#050505] rounded-full flex items-center justify-center z-20 shadow-lg shadow-red-500/40">
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40"></span>
            <span className="relative text-[8px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* --- Dropdown Menu --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="absolute right-0 mt-4 w-80 bg-[#0d0d12]/95 border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden backdrop-blur-3xl origin-top-right"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors z-[60] cursor-pointer"
            >
              <X size={20} />
            </button>
            
            {/* Header: Large Logo & Info (FIXED SECTION) */}
            <div className="flex flex-col items-center p-8 pb-6 bg-gradient-to-b from-blue-600/10 to-transparent">
              <motion.div variants={itemVariants} className="relative mb-4 group">
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-3xl opacity-60"></div>
                <div className="relative h-24 w-24 rounded-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-400 via-blue-700 to-indigo-950 flex items-center justify-center text-white font-extrabold text-4xl border-[5px] border-[#0d0d12] shadow-2xl uppercase tracking-tighter overflow-hidden">
                  {user.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt="avatar" 
                      width={96} 
                      height={96} 
                      className="rounded-full object-cover" 
                    />
                  ) : (
                    <span className="relative z-10">{userInitial}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                </div>
              </motion.div>

              <div className="text-center w-full px-4">
                <motion.p variants={itemVariants} className="text-xl font-bold text-white tracking-tight truncate">
                  {userData?.name || user.displayName || "User Account"}
                </motion.p>
                <motion.p variants={itemVariants} className="text-sm text-white/70 font-medium truncate mt-0.5 mb-4">
                  {user.email}
                </motion.p>
                
                <motion.div variants={itemVariants}>
                  <Link 
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                  >
                    Manage Account <ChevronRight size={14} />
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Scrollable Features Section */}
            <div className="max-h-[min(280px,calc(100vh-420px))] overflow-y-auto custom-scrollbar">
              {/* Menu Items */}
              <div className="px-3 py-1 space-y-1">
                <motion.div variants={itemVariants}>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-white/70 hover:bg-white/5 rounded-2xl transition-all group hover:text-white">
                    <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                      <LayoutDashboard size={18} className="text-blue-400" />
                    </div>
                    <span className="font-medium">Analytics Dashboard</span>
                  </Link>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Link href="/interview" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-white/70 hover:bg-white/5 rounded-2xl transition-all group hover:text-white">
                    <div className="p-2 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                      <Sparkles size={18} className="text-purple-400" />
                    </div>
                    <span className="font-medium">Mock Interviews</span>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/pricing" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-white/70 hover:bg-white/5 rounded-2xl transition-all group hover:text-white">
                    <div className="p-2 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                      <Sparkles size={18} className="text-yellow-400" />
                    </div>
                    <span className="font-medium">Pricing & Pro</span>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/#history" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-white/70 hover:bg-white/5 rounded-2xl transition-all group hover:text-white">
                    <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                      <LayoutDashboard size={18} className="text-emerald-400" />
                    </div>
                    <span className="font-medium">Your Interviews</span>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/scheduling" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-white/70 hover:bg-white/5 rounded-2xl transition-all group hover:text-white">
                    <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                      <Calendar size={18} className="text-blue-400" />
                    </div>
                    <span className="font-medium">Scheduling</span>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/notifications" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-white/70 hover:bg-white/5 rounded-2xl transition-all group hover:text-white border-t border-white/5 mt-1 pt-4">
                    <div className="relative p-2 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                      <Bell size={18} className="text-orange-400" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between flex-1">
                      <span className="font-medium">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/profile" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-white/70 hover:bg-white/5 rounded-2xl transition-all group hover:text-white">
                    <div className="p-2 bg-gray-500/10 rounded-xl group-hover:bg-gray-500/20 transition-colors">
                      <Settings size={18} className="text-white/70 group-hover:text-white" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Footer: Logout (FIXED AT BOTTOM) */}
            <motion.div variants={itemVariants} className="px-3 pb-3 mt-1 relative">
                <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-4 mx-3 bg-[#15151e] border border-white/10 rounded-[24px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.9)] z-[70] backdrop-blur-2xl"
                    >
                    <div className="absolute -bottom-1.5 left-12 w-3 h-3 bg-[#15151e] border-r border-b border-white/10 rotate-45"></div>

                    <div className="flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertTriangle size={24} className="text-red-500" />
                        </div>
                        
                        <h3 className="text-base font-bold text-white mb-2">Account Security</h3>
                        <p className="text-xs text-white/50 mb-6 leading-relaxed">
                        Would you like to sign out of your session or <span className="text-red-400 font-semibold">permanently delete</span> all your data?
                        </p>
                        
                        <div className="flex flex-col w-full gap-3">
                        <button
                            disabled={isDeleting}
                            onClick={handleSignOut}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <LogOut size={16} />
                            Sign Out Safely
                        </button>

                        <button
                            disabled={isDeleting}
                            onClick={handleDeleteAccount}
                            className="w-full py-3.5 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold rounded-xl transition-all border border-red-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {isDeleting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Deleting Data...
                            </>
                            ) : (
                            <>
                                <Trash2 size={16} />
                                Delete All Data
                            </>
                            )}
                        </button>
                        
                        <button
                            disabled={isDeleting}
                            onClick={() => setShowDeleteConfirm(false)}
                            className="w-full py-2 text-[10px] text-white/30 hover:text-white transition-all font-bold uppercase tracking-[0.2em] mt-1"
                        >
                            Stay Logged In
                        </button>
                        </div>
                    </div>
                    </motion.div>
                )}
                </AnimatePresence>

                <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group border border-transparent hover:border-red-500/10"
                >
                <div className="p-2 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                    <LogOut size={18} className="text-red-500 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <span>Sign Out Account</span>
                </button>
            </motion.div>
            
            <div className="pb-6 pt-2 text-center opacity-30 select-none">
                <p className="text-[10px] text-white uppercase tracking-[0.3em] font-black">PrepEdge Premium</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;