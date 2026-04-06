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

  // Note: We are NOT disabling body scroll here because the user specifically asked for "also scroll"
  
  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClick}
    >
      <div 
        ref={wrapper}
        className="relative w-full max-w-xl mx-auto p-4 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300"
      >
        <button
          onClick={onDismiss}
          className="absolute top-8 right-8 z-[110] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95 shadow-xl md:hidden"
        >
          <X size={20} />
        </button>
        
        {children}
      </div>
    </div>
  );
}
