"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/firebase/client";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { Camera, Loader2, Sparkles, LayoutDashboard, Settings, ChevronRight, X, Trash2, AlertTriangle, Calendar, Bell, LogOut, User as UserIcon, Pencil } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/client";
import { updateUserPhoto } from "@/lib/actions/auth.action";
import ImageCropper from "./ImageCropper";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateProfile } from "firebase/auth";
import { deleteUserAccount, getCurrentUser } from "@/lib/actions/auth.action";
import { getUnreadNotificationCount } from "@/lib/actions/notifications.action";

const UserMenu = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  if (loading) return <div className="h-10 w-10 animate-pulse bg-[var(--surface-card)] rounded-full border border-[var(--border-subtle)]" />;

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
      toast.success("Signed out successfully. We'll miss you!");
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
      {/* --- Trigger: Small Circle Logo with Dropdown Arrow --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group p-1 pr-2 rounded-full transition-all duration-300 active:scale-95 outline-none hover:bg-white/5 border border-transparent hover:border-white/10"
      >
        <div className="relative">
          {/* Animated Ring Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 blur-[2px] transition duration-500"></div>
          
          <div className="relative h-9 w-9 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#1e3a8a_0deg,#3b82f6_120deg,#2563eb_240deg,#1e3a8a_360deg)] flex items-center justify-center text-white font-bold text-base shadow-inner border border-white/20 overflow-hidden uppercase">
              <Image 
                src={userData?.photoURL || user.photoURL || "/user-avatar.webp"} 
                alt="avatar" 
                width={36} 
                height={36} 
                className="object-cover" 
                unoptimized={userData?.photoURL?.startsWith('data:') || user.photoURL?.startsWith('blob:')}
              />
          </div>

          {/* Global Notification Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-red-500 border-2 border-[var(--surface-base)] rounded-full flex items-center justify-center z-20 shadow-lg shadow-red-500/40">
              <span className="relative text-[7px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </span>
          )}

          {/* PRO Badge on Avatar (Restored for Navbar) */}
          {userData?.isPro && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-full flex items-center justify-center border-2 border-[var(--surface-base)] shadow-lg z-20">
              <Sparkles className="w-2 h-2 text-white fill-white" />
            </div>
          )}
        </div>


        {/* Dropdown Arrow */}
        <ChevronRight className={cn(
          "w-4 h-4 text-[var(--text-secondary)] transition-all duration-500 ease-out rotate-90",
          isOpen && "rotate-[270deg] text-blue-500"
        )} />
      </button>


      {/* --- Dropdown Menu --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="absolute right-0 mt-4 w-80 bg-[var(--dropdown-bg)]/95 border border-[var(--dropdown-border)] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden backdrop-blur-3xl origin-top-right"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-[var(--dropdown-text)] hover:text-[var(--dropdown-text-hover)] transition-colors z-[60] cursor-pointer"
            >
              <X size={20} />
            </button>
            
            {/* Header: Large Logo & Info (FIXED SECTION) */}
            <div className="flex flex-col items-center p-8 pb-6 bg-gradient-to-b from-blue-600/10 to-transparent">
              <motion.div variants={itemVariants} className="relative mb-4 group">
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-3xl opacity-60"></div>
                
                {/* Ring Effect */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-all duration-700 animate-pulse" />
                <div className="absolute -inset-0.5 rounded-full border border-dashed border-blue-500/50 group-hover:border-blue-500 group-hover:rotate-90 transition-all duration-1000" />

                <div className="relative h-24 w-24 rounded-full bg-[var(--surface-base)] flex items-center justify-center border-[5px] border-[var(--dropdown-bg)] shadow-2xl overflow-hidden">
                  <img 
                    src={userData?.photoURL || user.photoURL || "/user-avatar.webp"} 
                    alt="" 
                    className="h-full w-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                </div>

                {/* Floating Upload Button (Pencil Design) */}
                <div 
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={cn(
                      "absolute -bottom-1 -right-1 h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-[var(--dropdown-bg)] cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all z-30 group/btn",
                      uploading && "opacity-90 cursor-wait"
                    )}
                >
                    {uploading ? (
                      <div className="h-2.5 w-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Pencil className="w-2.5 h-2.5 group-hover/btn:rotate-12 transition-transform" />
                    )}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Image too large! Please use a file smaller than 2MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => setTempImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }} 
                  className="hidden" 
                  accept="image/*" 
                />
              </motion.div>

                <motion.div variants={itemVariants} className="text-center w-full px-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <p className="text-xl font-bold text-[var(--dropdown-text-hover)] tracking-tight truncate">
                      {userData?.name || user.displayName || "User Account"}
                    </p>
                    {userData?.isPro && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-600 text-[9px] font-black text-white rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/20 flex items-center gap-1">
                        <Sparkles size={8} className="fill-white" /> PRO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--dropdown-text)] font-medium truncate mt-0.5 mb-4">
                    {user.email}
                  </p>
                </motion.div>

                
                <motion.div variants={itemVariants}>
                  <Link 
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--dropdown-item-hover)] border border-[var(--dropdown-border)] rounded-full text-sm font-semibold text-[var(--dropdown-text-hover)] hover:bg-[var(--dropdown-item-hover)] hover:border-[var(--dropdown-border)] transition-all active:scale-95"
                  >
                    Manage Account <ChevronRight size={14} />
                  </Link>
                </motion.div>
              </div>
            
            {/* Scrollable Features Section */}
            <div className="max-h-[min(280px,calc(100vh-420px))] overflow-y-auto custom-scrollbar">
              {/* Menu Items */}
              <div className="px-3 py-1 space-y-1">
                <motion.div variants={itemVariants}>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)] rounded-2xl transition-all group hover:text-[var(--dropdown-text-hover)]">
                    <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                      <LayoutDashboard size={18} className="text-blue-400" />
                    </div>
                    <span className="font-medium">Analytics Dashboard</span>
                  </Link>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Link href="/interview" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)] rounded-2xl transition-all group hover:text-[var(--dropdown-text-hover)]">
                    <div className="p-2 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                      <Sparkles size={18} className="text-purple-400" />
                    </div>
                    <span className="font-medium">Mock Interviews</span>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/pricing" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)] rounded-2xl transition-all group hover:text-[var(--dropdown-text-hover)]">
                    <div className="p-2 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                      <Sparkles size={18} className="text-yellow-400" />
                    </div>
                    <span className="font-medium">Pricing & Pro</span>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/#history" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)] rounded-2xl transition-all group hover:text-[var(--dropdown-text-hover)]">
                    <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                      <LayoutDashboard size={18} className="text-emerald-400" />
                    </div>
                    <span className="font-medium">Your Interviews</span>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/scheduling" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)] rounded-2xl transition-all group hover:text-[var(--dropdown-text-hover)]">
                    <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                      <Calendar size={18} className="text-blue-400" />
                    </div>
                    <span className="font-medium">Scheduling</span>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/notifications" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)] rounded-2xl transition-all group hover:text-[var(--dropdown-text-hover)] border-t border-[var(--dropdown-border)] mt-1 pt-4">
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
                  <Link href="/profile" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-[var(--dropdown-text)] hover:bg-[var(--dropdown-item-hover)] rounded-2xl transition-all group hover:text-[var(--dropdown-text-hover)]">
                    <div className="p-2 bg-gray-500/10 rounded-xl group-hover:bg-gray-500/20 transition-colors">
                      <Settings size={18} className="text-[var(--dropdown-text)] group-hover:text-[var(--dropdown-text-hover)]" />
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
                    className="absolute bottom-full left-0 right-0 mb-4 mx-3 bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-[24px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.9)] z-[70] backdrop-blur-2xl"
                    >
                    <div className="absolute -bottom-1.5 left-12 w-3 h-3 bg-[var(--surface-card)] border-r border-b border-[var(--border-primary)] rotate-45"></div>

                    <div className="flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertTriangle size={24} className="text-red-500" />
                        </div>
                        
                        <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 tracking-tight">Leaving PrepEdge?</h3>
                        <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed px-2">
                        Would you like to sign out of your session or <span className="text-red-400 font-semibold underline decoration-red-500/30 underline-offset-4">permanently delete</span> all your data?
                        </p>

                        {/* Feedback Prompt */}
                        <div className="w-full bg-[var(--dropdown-item-hover)] border border-[var(--dropdown-border)] rounded-2xl p-4 mb-6 text-left relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                              <Sparkles size={32} className="text-blue-500" />
                           </div>
                           <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              Your feedback matters
                              <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                           </p>
                           <p className="text-[11px] text-[var(--text-primary)] font-medium leading-relaxed italic">
                              "Kya aapko hamari website use karne mein koi dikkaat hui? Aapko hamari website mein kya achha laga?"
                           </p>
                           <p className="text-[9px] text-[var(--text-muted)] mt-3 font-bold uppercase tracking-widest text-center border-t border-[var(--dropdown-border)] pt-2">
                              We'd love to hear from you
                           </p>
                        </div>
                        
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
                            className="w-full py-2 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all font-bold uppercase tracking-[0.2em] mt-1"
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
            
            <div className="pb-6 pt-2 text-center select-none">
                <p className={cn(
                  "text-[10px] uppercase tracking-[0.3em] font-black",
                  userData?.isPro ? "bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent animate-pulse" : "text-[var(--dropdown-text)] opacity-30"
                )}>
                  {userData?.isPro ? "PrepEdge Pro Member" : "PrepEdge Premium"}
                </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tempImage && (
          <ImageCropper
            image={tempImage}
            onCropComplete={async (croppedBlob) => {
              // Step 1: Close modal immediately
              setTempImage(null);
              if (!user) return;
              
              // Optimistic UI Update
              const optimisticUrl = URL.createObjectURL(croppedBlob);
              const previousPhotoUrl = user.photoURL;
              
              // Step 2: Update UI instantly
              setUser({ ...user, photoURL: optimisticUrl } as User);
              toast.success("Profile updated!");
              
              // Step 3: Background sync
              (async () => {
                try {
                    setUploading(true);
                    
                    // Convert Blob to Base64 String for 100% FREE storage in Firestore
                    const reader = new FileReader();
                    const base64Promise = new Promise<string>((resolve) => {
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.readAsDataURL(croppedBlob);
                    });
                    
                    const base64String = await base64Promise;
                    
                    // Save directly to Firestore Database
                    await updateUserPhoto(user.uid, base64String);
                    
                    // Update local state for immediate feedback
                    setUserData({...userData, photoURL: base64String});
                    router.refresh();
                } catch (err) {
                    console.error(err);
                    setUserData({...userData, photoURL: previousPhotoUrl});
                } finally {
                    setUploading(false);
                    URL.revokeObjectURL(optimisticUrl);
                }
              })();
            }}
            onCancel={() => setTempImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;