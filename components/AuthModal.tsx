"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  const onDismiss = useCallback(() => {
    setIsClosing(true);
    // Let the animation finish before navigating
    setTimeout(() => {
      router.push("/");
    }, 300);
  }, [router]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
            className="relative w-full max-w-xl mx-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="bg-[var(--surface-card)] rounded-[2.5rem] border-2 border-[var(--border-primary)] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative">
              {/* Internal Close Button */}
              <button
                onClick={onDismiss}
                className="absolute top-5 right-5 p-3 rounded-2xl bg-[var(--surface-base)] hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 border border-[var(--border-subtle)] transition-all active:scale-90 group z-[100] shadow-sm"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
