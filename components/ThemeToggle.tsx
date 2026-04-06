"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-10 bg-white/5 rounded-full border border-white/10" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 border",
        "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-90",
        "dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
      )}
      aria-label="Toggle Theme"
    >
      <div className="relative h-5 w-5 overflow-hidden">
        <Sun 
            className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-500 transform",
                isDark ? "translate-y-10 opacity-0 rotate-90" : "translate-y-0 opacity-100 rotate-0 text-yellow-500"
            )} 
        />
        <Moon 
            className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-500 transform",
                isDark ? "translate-y-0 opacity-100 rotate-0 text-blue-400" : "-translate-y-10 opacity-0 -rotate-90"
            )} 
        />
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 border border-white/10 rounded-lg text-[10px] text-white uppercase tracking-widest font-black whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none shadow-2xl z-[100]">
        Switch Theme
      </div>
    </button>
  );
};

export default ThemeToggle;
