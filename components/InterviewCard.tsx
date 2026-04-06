"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Interview, Feedback } from "@/constants";
import { getRandomInterviewCover, getTechLogos, cn } from "@/lib/utils";
import DisplayTechIcons from "./DisplayTechIcons";
import { useState, useEffect } from "react";
import { CheckCircle2, Star, Trash2, RotateCcw, MessageSquare, ArrowRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteInterview } from "@/lib/actions/general.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InterviewCardProps extends Interview {
  feedback?: Feedback | null;
  customHref?: string;
  coverImage?: string;
}

export default function InterviewCard({
  id,
  role,
  type,
  techstack,
  createdAt,
  finalized,
  feedback = null,
  customHref,
  coverImage,
  userId,
}: InterviewCardProps) {
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "Recent";

  const [coverSrc, setCoverSrc] = useState<string>("/covers/adobe.png");
  const [techIcons, setTechIcons] = useState<{ tech: string; url: string }[]>([]);

  useEffect(() => {
    setCoverSrc(coverImage || getRandomInterviewCover() || "/covers/adobe.png");

    const loadLogos = async () => {
      if (techstack && techstack.length > 0) {
        const logos = await getTechLogos(techstack);
        setTechIcons(logos);
      }
    };
    loadLogos();
  }, [techstack, coverImage]);

  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteInterview(id, userId);
      if (res.success) {
        toast.success("Interview deleted successfully.");
        router.refresh();
      } else {
        toast.error("Failed to delete interview.");
      }
    } catch (err) {
      toast.error("An error occurred while deleting.");
    } finally {
      setDeleting(false);
    }
  };

  const isCompleted = finalized || !!feedback;
  const linkPath =
    customHref || (isCompleted ? `/interview/${id}/feedback` : `/interview/${id}`);

  return (
    <div
      className={cn(
        "group relative bg-[var(--surface-card-alt)] border p-6 rounded-[28px] w-full transition-all duration-300",
        isCompleted
          ? "border-blue-500/20 hover:border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.05)]"
          : "border-gray-800/50 hover:border-white/10"
      )}
    >
      {/* Top Row: Date & Type Badge */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">
          {formattedDate}
        </span>
        <div className="flex gap-2">
          {isCompleted && (
            <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase">
              <CheckCircle2 className="w-2.5 h-2.5" /> Done
            </span>
          )}
          <span
            className={cn(
              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border",
              normalizedType === "Technical"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            )}
          >
            {normalizedType}
          </span>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                className="p-1 px-2.5 rounded-lg bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-90"
                title="Delete Interview"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-950 border border-white/10 rounded-[3rem] p-10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black text-white">Delete Session?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400 font-medium">
                  This will permanently remove your <span className="text-white font-bold">{role}</span> interview session and all associated AI feedback. This action cannot be undone. Are you sure you want to proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8">
                <AlertDialogCancel className="rounded-2xl font-bold bg-white/5 border-white/10 hover:bg-white/10 text-white">
                  Keep Session
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="rounded-2xl font-bold bg-red-600 hover:bg-red-500 text-white"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Forever"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Center: Cover Image & Role */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative mb-4">
          <div
            className={cn(
              "absolute -inset-2 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity",
              isCompleted ? "bg-blue-600" : "bg-slate-600"
            )}
          />
          <div className="relative bg-[#1a1a28] rounded-full p-1 border border-[var(--border-subtle)]">
            <Image
              src={coverSrc}
              alt="role cover"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          </div>
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight capitalize">
          {role} <span className="text-[var(--text-secondary)] font-medium">Interview</span>
        </h3>
      </div>

      {/* Stats: Performance & Stack with Mesh-Glow Hover (Aligned with Strategies) */}
      <div
        className={cn(
          "group/rating relative flex items-center justify-between border rounded-2xl p-4 mb-6 transition-all duration-500 overflow-hidden backdrop-blur-md hover:backdrop-blur-xl",
          isCompleted
            ? "bg-blue-500/5 border-blue-500/10 hover:border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.03)] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            : "bg-white/[0.03] border-[var(--border-subtle)] hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        )}
      >
        {/* Rating Mesh-Glow Overlay (Strategies Intensity) */}
        <div 
          className={cn(
            "absolute inset-0 opacity-0 group-hover/rating:opacity-100 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
            isCompleted 
              ? "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_70%)]" 
              : "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_70%)]"
          )}
        />

        <div className="flex flex-col relative z-10 transition-transform group-hover/rating:translate-x-1 duration-500">
          <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] mb-1 tracking-widest opacity-70">
            Performance
          </span>
          <div className="flex items-baseline gap-0.5 relative">
            {/* Score Aura Halo */}
            <div className={cn(
              "absolute -inset-6 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-700",
              isCompleted ? "bg-blue-500/25" : "bg-white/10"
            )} />
            
            <p
              className={cn(
                "text-2xl font-black transition-all duration-500 group-hover:scale-110",
                isCompleted ? "text-blue-400 group-hover:text-blue-300" : "text-white group-hover:text-blue-200"
              )}
            >
              {feedback?.totalScore ?? "—"}
            </p>
            <span className="text-[10px] text-gray-500 font-bold ml-0.5 opacity-50">/100</span>
          </div>
        </div>

        <div className="flex flex-col items-end relative z-10 transition-transform group-hover/rating:-translate-x-1 duration-500">
          <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] mb-1 tracking-widest opacity-70">Stack</span>
          <div className="group-hover/rating:scale-110 group-hover:scale-105 transition-transform duration-500">
            <DisplayTechIcons techIcons={techIcons} />
          </div>
        </div>
      </div>

      {/* Action Buttons: Enhanced Interactive States */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isCompleted ? (
          <>
            <Button
              asChild
              variant="outline"
              className="group/retake flex-1 font-bold h-12 rounded-xl transition-all active:scale-95 hover:scale-[1.02] bg-[var(--search-bg)] hover:bg-blue-500/5 text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-blue-500/40 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            >
              <Link href={`/interview?role=${encodeURIComponent(role)}&type=${encodeURIComponent(type)}`} className="flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4 transition-transform duration-500 group-hover/retake:rotate-180" />
                Retake
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1 font-bold h-12 rounded-xl transition-all active:scale-95 hover:scale-[1.02] bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
            >
              <Link href={`/interview/${id}/feedback`} className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Feedback
              </Link>
            </Button>
          </>
        ) : (
          <Button
            asChild
            className="group/launch w-full font-bold h-12 rounded-xl transition-all active:scale-95 hover:scale-[1.02] bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
          >
            <Link href={linkPath} className="flex items-center justify-center gap-2">
              Launch Interview
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/launch:translate-x-1" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}