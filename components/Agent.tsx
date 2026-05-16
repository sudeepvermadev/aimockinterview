"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback, getInterviewsByUserId } from "@/lib/actions/general.action";
import { toast } from "sonner";
import { Quote, Activity, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractScoreFromText } from "@/lib/utils";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type?: string;
  role?: string;
  questions?: string[];
  userPhotoUrl?: string;
  walletBalance?: number;
  isPro?: boolean;
}


const Agent = ({ userName, userId, interviewId, feedbackId, type, role, questions, userPhotoUrl, walletBalance, isPro }: AgentProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [partialTranscript, setPartialTranscript] = useState<string>("");
  const [textInput, setTextInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proTip, setProTip] = useState<string | null>(null);
  const [liveScore, setLiveScore] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  
  // Missing States found during fix
  const [isRecovering, setIsRecovering] = useState(false);
  const [volume, setVolume] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [micState, setMicState] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [hasDetectedVoice, setHasDetectedVoice] = useState(false);
  
  // Suppression: Intercept benign Vapi console errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const msg = args.join(" ").toLowerCase();
      if (msg.includes("meeting ended in error") || msg.includes("meeting has ended")) {
        console.log("ℹ️ [Suppressed] Vapi Internal Message:", args[0]);
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  // Local Persistence: Save session
  useEffect(() => {
    if (messages.length > 0) {
      const key = `prepedge-session-${interviewId || 'current'}`;
      localStorage.setItem(key, JSON.stringify({
        messages,
        proTip,
        liveScore,
        callId,
        lastUpdate: new Date().toISOString()
      }));
    }
  }, [messages, proTip, liveScore, interviewId, callId]);

  // Reset session state when interview parameters change (Next.js component reuse)
  useEffect(() => {
    setMessages([]);
    setLastMessage("");
    setProTip(null);
    setLiveScore(null);
    setErrorMessage(null);
    setCallId(null);
  }, [interviewId, role, type]);

  const handleSendMessage = () => {
    if (!textInput.trim()) return;
    vapi.send({
      type: "add-message",
      message: {
        role: "user",
        content: textInput,
      },
    });
    const newMessage = { role: "user", content: textInput } as SavedMessage;
    setMessages((prev) => [...prev, newMessage]);
    setTextInput("");
  };

  useEffect(() => {
    const onCallStart = () => {
      console.log("✅ Vapi: call-start fired");
      setStatus(CallStatus.ACTIVE);
      setErrorMessage(null);
      
      // Force unmute to ensure the browser stream is active
      try {
        vapi.setMuted(false);
      } catch (e) {
        console.warn("Could not explicitly set muted state", e);
      }

      if (questions && questions.length > 0) {
        const questionsText = `[SYSTEM INSTRUCTION]: Here are the exact questions you MUST ask during this interview:\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
        
        vapi.send({
          type: "add-message",
          message: {
            role: "system",
            content: questionsText
          }
        });
        console.log("✅ Injected generated questions into Vapi context.");
      }
    };

    const onCallStartSuccess = (event: any) => {
      console.log("✅ Vapi: call-start-success", event);
      if (event?.callId) setCallId(event.callId);
    };

    const onCallEnd = () => {
      console.log("✅ Vapi: call-end fired");
      setStatus(CallStatus.FINISHED);
      setIsUserSpeaking(false);
      setIsAssistantSpeaking(false);
    };

    const onMessage = (message: any) => {
      console.log("📨 Vapi message:", message);
      
      if (message.type === "transcript") {
        console.log(`🎙️ [${message.transcriptType}] ${message.role}: ${message.transcript}`);
        
        if (message.transcriptType === "final") {
          const newMessage = { role: message.role, content: message.transcript } as SavedMessage;
          setMessages((prev) => [...prev, newMessage]);
          setPartialTranscript(""); 

          if (message.role === "assistant") setIsAssistantSpeaking(false);
          if (message.role === "user") setIsUserSpeaking(false);

          if (message.transcript.toLowerCase().includes("interview complete") || 
              message.transcript.toLowerCase().includes("interview is complete")) {
            console.log("🎯 Conclusion detected in transcript. Ending call...");
            vapi.stop();
            setStatus(CallStatus.FINISHED);
          }
        } else if (message.transcriptType === "partial") {
          setPartialTranscript(message.transcript);
          if (message.role === "assistant") setIsAssistantSpeaking(true);
          if (message.role === "user") setIsUserSpeaking(true);
        }
      }
    };

    const onSpeechStart = () => {
      console.log("🎙️ Vapi: User started speaking (Mic active)");
      setIsUserSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("🙊 Vapi: User stopped speaking");
      setIsUserSpeaking(false);
    };

    const onVolumeLevel = (vol: number) => {
      setVolume(vol);
      if (vol > 0.02) {
        if (!hasDetectedVoice) {
          console.log("🔊 Mic Input detected (First time):", vol.toFixed(2));
          setHasDetectedVoice(true);
        }
        // Occasional log to confirm active stream
        if (Math.random() > 0.99) console.log("🔊 Audio stream active (Vol):", vol.toFixed(2));
      }
    };

    const onError = (error: any) => {
      let reason = "Unknown error";
      
      if (typeof error === "string") {
        reason = error;
      } else if (error?.error?.message?.msg) {
        reason = error.error.message.msg;
      } else if (error?.error?.message) {
        reason = typeof error.error.message === 'string' ? error.error.message : JSON.stringify(error.error.message);
      } else if (error?.message) {
        reason = error.message;
      } else if (error?.errorMsg) {
        reason = error.errorMsg;
      } else {
        reason = JSON.stringify(error);
      }

      // Vapi triggers an "error" event when the session ends gracefully or via WebRTC disconnects.
      const benignKeywords = [
        "meeting has ended",
        "meeting ended in error",
        "meeting-ended",
        "session ended",
        "call ended",
        "participant-left",
        "disconnected",
        "transport changed",
        "ejected",
        "ejection"
      ];

      const isBenign = benignKeywords.some(keyword => reason.toLowerCase().includes(keyword));

      if (isBenign) {
        console.log("ℹ️ [Suppressed] Vapi session concluded normally:", reason);
        // Only set status to finished if we are still active or connecting
        if (status === CallStatus.ACTIVE || status === CallStatus.CONNECTING) {
          setStatus(CallStatus.FINISHED);
        }
        return;
      }

      console.error("❌ [v2.1] Vapi Raw Error Object:", JSON.stringify(error, null, 2));
      console.error("❌ Vapi Error Reason:", reason);

      if (reason.toLowerCase().includes("permission") || reason.toLowerCase().includes("microphone")) {
        setErrorMessage("❌ Your browser didn't allow microphone access. Check your address bar lock icon and make sure you are using HTTPS://.");
      } else {
        setErrorMessage(`Connection failed: ${reason}`);
      }

      setStatus(CallStatus.INACTIVE);
      setIsRecovering(false);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-start-success", onCallStartSuccess);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("volume-level", onVolumeLevel);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-start-success", onCallStartSuccess);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("volume-level", onVolumeLevel);
      vapi.off("error", onError);
      
      // Only stop if we are in an active-like state to avoid "Meeting already ended" errors
      try {
        vapi.stop();
      } catch (e) {
        // Silently fail on cleanup stop
      }
    };
  }, [questions]); // Re-bind if questions change

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsgObj = messages[messages.length - 1];
      if (lastMsgObj.content !== lastMessage) {
        setLastMessage(lastMsgObj.content);
      }

      // Extract Pro Tip and Score from assistant messages
      if (lastMsgObj.role === "assistant" && status === CallStatus.ACTIVE) {
        const proTipMatch = lastMsgObj.content.match(/Pro Tip:\s*([^\.]+[\.]?)/i);
        if (proTipMatch) setProTip(proTipMatch[1].trim());

        // Improved regex to handle "70/100", "70-100", or "Score: 70"
        const scoreMatch = lastMsgObj.content.match(/(?:Final Score|Score|Marks|Assessment|Index):\s*(\d+)(?:\s*[-\/]\s*\d+)?/i);
        if (scoreMatch) {
          setLiveScore(scoreMatch[1]);
        } else {
          // Robust fallback for words or other patterns
          const extracted = extractScoreFromText(lastMsgObj.content);
          if (extracted > 0) setLiveScore(extracted.toString());
        }
      }
    }
  }, [messages, status, lastMessage]);

  const handleGenerateFeedback = useCallback(async () => {
    // Small Delay: ensure last transcription finishes
    await new Promise(r => setTimeout(r, 1500));
    
    if (messages.length < 2) {
      console.warn("⚠️ Not enough messages for feedback generation.");
      return;
    }

    let finalInterviewId = interviewId;
    const effectiveUserId = userId || "vapi-session";

    if (!finalInterviewId && effectiveUserId) {
      try {
        const recentInterviews = await getInterviewsByUserId(effectiveUserId);
        if (recentInterviews && recentInterviews.length > 0) {
          finalInterviewId = recentInterviews[0].id;
        }
      } catch (err) {
        console.error("Failed to fetch recent interview for feedback linking", err);
      }
    }

    if (!finalInterviewId || isGenerating) {
      console.warn("⏭️ Skipping feedback: ID missing or already generating.", { finalInterviewId, isGenerating });
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Analyzing your interview... This may take a minute.");
    
    try {
      console.log("🚀 Calling createFeedback with:", { finalInterviewId, effectiveUserId, messageCount: messages.length, liveScore });
      const result = await createFeedback({
        interviewId: finalInterviewId,
        userId: effectiveUserId,
        transcript: messages,
        questions: questions,
        feedbackId,
        liveScore: liveScore ? parseInt(liveScore) : undefined
      });


      if (result.success) {
        toast.success("Feedback generated!", { id: toastId });
        console.log("✅ Feedback generated, redirecting to:", `/interview/${finalInterviewId}/feedback`);
        router.push(`/interview/${finalInterviewId}/feedback`);
      } else {
        console.error("❌ Feedback generation failed:", result.error);
        toast.error(result.error || "Feedback generation failed on server. Redirecting to transcript...", { id: toastId });
        // Even if it failed, redirect to feedback page to show the captured transcript (Tracking System)
        setTimeout(() => {
          router.push(`/interview/${finalInterviewId}/feedback`);
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Exception during createFeedback:", error);
      toast.error("An error occurred during feedback analysis. Showing session log...", { id: toastId });
      setTimeout(() => {
        router.push(`/interview/${finalInterviewId}/feedback`);
      }, 2000);
    }
  }, [messages, interviewId, userId, isGenerating, questions, feedbackId, liveScore, router]);

  useEffect(() => {
    if (status === CallStatus.FINISHED) {
      // Only redirect if there was no error — otherwise let the user see the rejection message
      if (errorMessage) {
        console.warn("⚠️ Ending call but staying on page due to error:", errorMessage);
        return;
      }

      handleGenerateFeedback();
    }
  }, [status, errorMessage, handleGenerateFeedback]);

  const handleCall = async () => {
    // Reset all session states before starting a new call
    setMessages([]);
    setLastMessage("");
    setProTip(null);
    setLiveScore(null);
    setErrorMessage(null);
    setCallId(null);

    if (interviewId || 'current') {
      localStorage.removeItem(`prepedge-session-${interviewId || 'current'}`);
    }

    if (!isRecovering) {
      setRetryCount(0);
      setUseFallback(false);
    }

    // Guard: check mic permission if the API is available (requires HTTPS or localhost)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        console.log("✅ Microphone permission granted");
      } catch (micError: any) {
        console.error("❌ Microphone access denied:", micError);
        setErrorMessage(
          `Microphone blocked: ${micError?.message || "Permission denied"}. ⚠️ If you are on an ngrok link, please make sure you are using HTTPS:// and not HTTP://.`
        );
        return;
      }
    } else {
      setErrorMessage("⚠️ Your browser blocked microphone access because this page is not using a secure (HTTPS) connection. Please switch to the HTTPS link.");
      return;
    }

    // 1. Logic Guard: Check Coins for Non-Pro Users
    if (userId && userId !== "vapi-session" && !isPro) {
      const balance = walletBalance || 0;
      if (balance < 50) {
        toast.error("Insufficient PrepCoins", {
          description: "You need 50 PrepCoins to start a new interview. Please recharge your wallet.",
          action: {
            label: "Recharge",
            onClick: () => router.push("/pricing")
          }
        });
        return;
      }
    }

    setStatus(CallStatus.CONNECTING);

    try {
      console.log("🚀 Starting Vapi call with full inline assistant config");

      const systemPrompt = `# ROLE
You are Alex, an Elite Interview Prep Coach from PrepEdge. Your goal is to guide the user through a highly professional and effective mock interview.

# PHASE 1: ONBOARDING
If any of these details are missing, ask for them one by one:
1. Job Role
2. Interview Focus (Technical, Behavioral, Mixed)
3. Experience Level
4. Question Count
5. Tech Stack / Keywords

ONLY call 'generateInterview' once ALL 5 details are confirmed. Use userId: "${userId || 'vapi-session'}".

# PHASE 2: INTERVIEWING
- Ask the generated questions one by one.
- **Multimodal Support**: You will receive input via both voice (transcription) and text. Treat both as valid candidate responses. Respond to the substance of their answer.
- **Pro Tip**: After the user provides an answer, give a brief evaluation and then provide a "Pro Tip: [Your tip here]". Keep the tip under 20 words. 
- Then, proceed to the next question.

# PHASE 3: WRAP-UP
When the interview is done:
1. Provide a "Final Score: [Score]/100" (e.g. "Final Score: 85/100"). ALWAYS use numeric digits. DO NOT provide a range (like 70-100), just give a single definite score.
2. Say EXACTLY: "Interview complete. Your detailed feedback and score are now available on your home dashboard. Checking out now!".
3. Then gracefully hang up the call.`;

      const publicUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      console.log("✅ Using Public URL for Vapi tools:", publicUrl);
      setMicState('granted');

      const assistantConfig: any = {
        name: "PrepEdge AI Coach",
        firstMessage: `Hello ${userName}! I'm Alex, your AI Coach for this ${role} interview focused on ${type}. Are you ready to get started?`,
        transcriber: { 
          provider: "openai", 
          model: "gpt-4o-mini-transcribe", 
          language: "en"
        },
        voice: { provider: "11labs", voiceId: "burt" },
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
          ],
          tools: [
            {
              type: "function",
              async: true,
              messages: [
                {
                  type: "request-start",
                  content: "I am generating your interview now, please give me a few seconds."
                },
                {
                  type: "request-complete",
                  content: "Perfect, I have the questions ready."
                }
              ],
              function: {
                name: "generateInterview",
                description: "Generates a customized interview test based on user choices",
                parameters: {
                  type: "object",
                  properties: {
                    role: { type: "string", description: "The job role the user is interviewing for" },
                    type: { type: "string", description: "The focus of the interview" },
                    level: { type: "string", description: "The seniority level" },
                    amount: { type: "string", description: "The total number of questions requested" },
                    techstack: { type: "string", description: "Programming languages or tools" },
                    userId: { type: "string", description: "The unique ID of the user taking the interview" }
                  },
                  required: ["role", "type", "level", "techstack", "amount", "userId"]
                }
              },
              server: {
                url: `${publicUrl}/api/vapi/generate`
              }
            }
          ]
        },
      };

      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

      if (assistantId) {
        console.log("🚀 Starting Vapi call with Assistant ID + Local Overrides:", assistantId);
        // Passing assistantConfig as the second argument overrides the dashboard settings
        // This ensures the dynamic ngrok URL and system prompt are used.
        await vapi.start(assistantId, assistantConfig);
      } else {
        console.log("🚀 Starting Vapi call with standalone inline assistant config");
        await vapi.start(assistantConfig);
      }
    } catch (err: any) {
      console.error("❌ Vapi Start Exception:", err);
      setStatus(CallStatus.INACTIVE);
      setErrorMessage(`Failed to start call: ${err?.message || String(err)}`);
      setIsRecovering(false);
    }
  };

  const handleDisconnect = () => {
    setStatus(CallStatus.FINISHED);
    setIsRecovering(false);
    setRetryCount(0);
    vapi.stop();
  };

  if (status === CallStatus.FINISHED) {
    return (
      <div className="w-full min-h-screen bg-[var(--surface-base)] px-6 py-20 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-12">
          {/* HEADER */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mx-auto">
              <CheckCircle className="w-3 h-3" /> Session Successfully Concluded
            </div>
            <h1 className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">Interview Performance Report</h1>
            <p className="text-[var(--text-secondary)] font-bold max-w-xl mx-auto leading-relaxed">
              Your interview with AI Coach Alex has finished. Review the session log below while we finalize your technical analysis.
            </p>
          </div>

          {/* LAST USER RESPONSE ONLY */}
          {(() => {
            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
            if (!lastUserMsg) return null;
            return (
              <div className="bg-[var(--surface-card)] rounded-[3rem] border border-[var(--border-primary)] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Quote className="w-40 h-40 text-blue-500" />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Your Last Response
                  </h3>
                  <div className="p-6 rounded-[2rem] border bg-[var(--surface-base)] border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[var(--surface-card-alt)] rounded-lg flex items-center justify-center text-[10px] font-black text-[var(--text-muted)]">U</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{userName || 'Candidate'}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{lastUserMsg.content}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
            <Button
              onClick={() => {
                if (isGenerating) {
                   toast.info("Generating report... please wait.");
                } else {
                   const effectiveInterviewId = interviewId;
                   router.push(`/interview/${effectiveInterviewId}/feedback`);
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-7 rounded-2xl font-black text-lg shadow-2xl shadow-blue-600/20 w-full sm:w-auto transition-all active:scale-95"
            >
              {isGenerating ? (
                <span className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Full Analysis...
                </span>
              ) : (
                "View Detailed Performance Analysis"
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="bg-[var(--surface-base)] border-[var(--border-subtle)] hover:bg-[var(--surface-card-alt)] text-[var(--text-secondary)] px-10 py-7 rounded-2xl font-black text-lg w-full sm:w-auto transition-all active:scale-95"
            >
              Start New Mock Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-col items-center justify-start pt-8 md:pt-16 gap-6 md:gap-10 p-4 md:p-8 min-h-screen bg-[var(--surface-base)] overflow-x-hidden">


        {/* Error Banner */}
        {errorMessage && (
          <div className="w-full max-w-2xl bg-red-500/20 border border-red-500/50 rounded-xl px-4 md:px-5 py-3 md:py-4 text-red-300 text-xs md:text-sm text-center">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="call-view w-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 relative px-4">
          {/* Ambient Arena Glow */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 blur-[120px] rounded-full transition-all duration-1000 opacity-40" />
          <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full transition-all duration-1000 opacity-20" />

          {/* AI Interviewer Card */}
          <div className="arena-card group z-20 max-w-xs md:max-w-sm">
            <div className="avatar">
               <Image
                 src="/ai-avatar-premium.png"
                 alt="AI Interviewer"
                 width={80}
                 height={80}
                 className="object-contain rounded-full shadow-lg border-2 border-[var(--border-subtle)]"
               />
            </div>
            <h3 className="text-[var(--text-primary)] font-bold text-xl tracking-tight z-10 mt-4 md:mt-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">AI Coach Alex</h3>
            <div className="mt-2 flex items-center gap-2">
                <span className={cn(
                    "w-2 h-2 rounded-full",
                    status === CallStatus.ACTIVE ? "bg-emerald-500 animate-pulse" : "bg-[var(--text-muted)] opacity-20"
                )} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {status === CallStatus.ACTIVE ? (isAssistantSpeaking ? "Alex is Speaking..." : "Online & Listening") : "Initializing Agent"}
                </span>
            </div>
          </div>

          {/* User Card */}
          <div className="arena-card group z-20 max-w-xs md:max-w-sm">
             {/* Local Ambient User Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-600/10 blur-[100px] rounded-full transition-all duration-1000 opacity-0" />
             
             <div className="avatar">
                <Image
                   src={userPhotoUrl || "/user-avatar.webp"}
                   alt="User Avatar"
                   width={100}
                   height={100}
                   priority
                   className="rounded-full object-cover border-4 border-[var(--border-primary)] shadow-lg"
                   unoptimized={userPhotoUrl?.startsWith('data:')}
                 />
                
                {isUserSpeaking && (
                  <div className="absolute inset-[-10px] rounded-full border-2 border-emerald-400/40 opacity-20" />
                )}
             </div>
             
              <h3 className="text-[var(--text-primary)] font-bold text-lg md:text-xl capitalize leading-tight mt-4 md:mt-6 z-10">{userName}</h3>
             <div className="mt-4 flex items-center justify-center gap-2 z-10">
                  <span className={cn(
                      "w-2 h-2 rounded-full",
                      isUserSpeaking ? "bg-emerald-400 animate-pulse" : "bg-[var(--text-muted)] opacity-20"
                  )} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {isUserSpeaking ? "Voice Detected" : (status === CallStatus.ACTIVE ? "Online & Listening" : "Waiting for Call")}
                  </span>
             </div>
          </div>
        </div>

        {/* Live Pro Tip & Score */}
        <div className="w-full max-w-2xl flex flex-col gap-3 md:gap-4 px-2">
          {proTip && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 md:px-5 py-2.5 md:py-3 text-blue-600 dark:text-blue-300 text-xs md:text-sm animate-in fade-in slide-in-from-top-2">
              <span className="font-bold text-blue-600 dark:text-blue-400">💡 Pro Tip:</span> {proTip}
            </div>
          )}
        </div>

        {/* Transcript */}
        {(messages.length > 0 || partialTranscript) && (
          <div className="transcript-border mt-4 w-full flex justify-center">
            <div className="transcript min-h-[4rem] flex items-center justify-center">
              <p
                className={cn(
                  "text-[var(--text-primary)] text-center text-lg transition-all duration-300",
                  partialTranscript ? "opacity-60 scale-95" : "opacity-100 scale-100"
                )}
              >
                {partialTranscript || lastMessage}
              </p>
            </div>
          </div>
        )}

        {/* Text input fallback */}
        {status === CallStatus.ACTIVE && (
          <div className="w-full max-w-2xl mt-4 flex flex-col sm:flex-row gap-2 px-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your response here..."
              className="flex-1 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm md:text-base text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 px-6 py-3 rounded-xl text-white font-bold hover:bg-blue-700 transition-all active:scale-95 text-sm md:text-base"
            >
              Send
            </button>
          </div>
        )}

        {/* Call Buttons */}
        <div className="w-full flex flex-col items-center gap-4 mt-6">
          {status !== CallStatus.ACTIVE && status !== CallStatus.CONNECTING ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => handleCall()}
                className="bg-blue-600 px-8 py-3 rounded-full text-white font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Start Call
                </span>
              </button>

              {errorMessage && (
                <button
                  onClick={() => { setUseFallback(true); handleCall(); }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Try again with Fallback (OpenAI Engine)
                </button>
              )}
            </div>
          ) : status === CallStatus.CONNECTING || isRecovering ? (
            <button
              disabled
              className="bg-blue-600/50 px-8 py-3 rounded-full text-white font-bold opacity-70 cursor-not-allowed shadow-lg"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                {isRecovering 
                  ? (useFallback ? "Switching to backup server..." : "Recovering connection...")
                  : "Connecting..."
                }
              </span>
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="bg-red-500 px-8 py-3 rounded-full text-white font-bold hover:bg-red-600 transition-all shadow-lg active:scale-95"
            >
              End Interview
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Agent;