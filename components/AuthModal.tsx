"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function AuthModal({ children }: { children: React.ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlay.current || e.target === wrapper.current) {
        if (onDismiss) onDismiss();
      }
    },
    [onDismiss, overlay, wrapper]
  );

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
    <div
      ref={overlay}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500 p-2 sm:p-4"
      onClick={onClick}
    >
      <div 
        ref={wrapper}
        className="relative w-full max-w-xl mx-auto animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out"
      >
        <div className="bg-[var(--surface-card)] rounded-[2.5rem] border-2 border-[var(--border-primary)] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative">
          {/* Internal Close Button - Better for Laptop Screens */}
          <button
            onClick={onDismiss}
            className="absolute top-6 right-6 p-2 rounded-xl bg-[var(--surface-base)] hover:bg-[var(--surface-card-alt)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-all active:scale-90 hover:rotate-90 group z-[100]"
          >
            <X size={20} className="group-hover:scale-110 transition-transform" />
          </button>

          {children}
        </div>
      </div>
    </div>

  );
}
