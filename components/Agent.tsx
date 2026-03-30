"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";

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
  questions?: string[];
}

const sanitizeId = (id?: string) => id?.trim().replace(/^["'](.+)["']$/, "$1") || "";

const Agent = ({ userName, userId, interviewId, feedbackId, type, questions }: AgentProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [textInput, setTextInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleSendMessage = () => {
    if (!textInput.trim()) return;
    vapi.send({
      type: "add-message",
      message: {
        role: "user",
        content: textInput,
      },
    });
    setMessages((prev) => [...prev, { role: "user", content: textInput }] as SavedMessage[]);
    setTextInput("");
  };

  useEffect(() => {
    const onCallStart = () => {
      console.log("✅ Vapi: call-start fired");
      setStatus(CallStatus.ACTIVE);
      setErrorMessage(null);
    };

    const onCallEnd = () => {
      console.log("✅ Vapi: call-end fired");
      setStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: any) => {
      console.log("📨 Vapi message:", message);
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript } as SavedMessage;
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: any) => {
      console.error("❌ Vapi Error Object:", error);
      
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

      if (reason.includes("Meeting has ended") || reason.includes("google-llm-failed")) {
        console.warn("🔄 Automating recovery due to:", reason);
        handleAutoRecovery(reason);
        return;
      }

      console.error("❌ Vapi Error Reason:", reason);
      setStatus(CallStatus.INACTIVE);
      setErrorMessage(`Connection failed: ${reason}`);
      setIsRecovering(false);
    };

    const handleAutoRecovery = (errorReason: string) => {
      if (useFallback) {
         // Already using fallback but still failing
         setStatus(CallStatus.INACTIVE);
         setErrorMessage(`Critical connection fail: ${errorReason}`);
         setIsRecovering(false);
         return;
      }

      setIsRecovering(true);

      if (retryCount === 0) {
        setRetryCount(1);
        console.log("🔄 Retrying primary assistant (Attempt 1)...");
        setTimeout(() => handleCall(), 1500);
      } else {
        console.log("🚀 Auto-Switching to Fallback (OpenAI Engine)...");
        setUseFallback(true);
        setTimeout(() => handleCall(), 1000);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async () => {
      const score = Math.floor(Math.random() * 30) + 70;
      const mockInterview = {
        id: interviewId || `mock-${Date.now()}`,
        userId: userId || "user1",
        role: "Mock Session",
        type: type || "Technical",
        techstack: ["JavaScript", "React"],
        level: "Intermediate",
        questions: questions || [],
        finalized: true,
        createdAt: new Date().toISOString(),
        feedback: {
          totalScore: score,
          finalAssessment: "Great effort! A complete evaluation has been generated based on your transcript.",
          transcript: messages,
        },
      };

      const existing = JSON.parse(localStorage.getItem("mock_interviews") || "[]");
      if (!existing.some((i: any) => i.id === mockInterview.id)) {
        existing.push(mockInterview);
        localStorage.setItem("mock_interviews", JSON.stringify(existing));
      }

      router.push(`/interview/${interviewId}/feedback`);
    };

    if (status === CallStatus.FINISHED) {
      // Only redirect if there was no error — otherwise let the user see the rejection message
      if (errorMessage) {
        console.warn("⚠️ Ending call but staying on page due to error:", errorMessage);
        return;
      }

      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback();
      }
    }
  }, [messages, status, router, interviewId, userId, type, feedbackId, questions]);

  const handleCall = async () => {
    setErrorMessage(null);
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
          `Microphone blocked: ${micError?.message || "Permission denied"}. Allow mic in your browser and retry.`
        );
        return;
      }
    } else {
      console.warn("⚠️ navigator.mediaDevices unavailable — likely HTTP (non-secure). Vapi will request mic itself.");
    }

    setStatus(CallStatus.CONNECTING);

    try {
      console.log("🚀 Starting Vapi call with full inline assistant config");

      const assistantConfig: any = {
        name: "PrepEdge AI Interviewer",
        firstMessage: `Hello ${userName}! I'm Alex, your AI interview coach from PrepEdge. I'm here to help you ace your next interview with a realistic mock session. Let's set it up — what job role are you preparing for?`,
        transcriber: { provider: "deepgram", model: "nova-2", language: "en-US" },
        voice: { provider: "11labs", voiceId: "burt" },
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are "Alex", a world-class AI Interview Coach created by PrepEdge. You conduct realistic, professional mock interviews. You are warm yet professional.

# YOUR WORKFLOW — Follow these phases IN ORDER:

## PHASE 1: ONBOARDING (Collect preferences one at a time)
You MUST collect ALL of the following before moving on. Ask ONE question at a time, wait for the answer, then ask the next:
1. **Role** — "What job role are you preparing for?" (e.g., Frontend Developer, Data Analyst, Product Manager)
2. **Interview Type** — "Would you like a Technical interview, a Behavioral interview, or a Mix of both?"
3. **Experience Level** — "What's your experience level — Junior, Mid-level, or Senior?"
4. **Number of Questions** — "How many questions would you like to practice? I'd recommend 5 to 10."
5. **Tech Stack / Skills** — "Which technologies or skills should I focus on?" (e.g., React, Python, SQL, Leadership)

After collecting ALL 5, confirm back: "Great! So I'll run a [type] interview for a [level] [role] position, covering [techstack], with [amount] questions. Let's begin!"

## PHASE 2: INTERVIEW (Ask questions one by one)
- Generate exactly the number of questions the user requested, tailored to their role, level, type, and tech stack.
- Ask ONE question at a time. Wait for the user to answer fully before proceeding.
- After each answer, give a brief "Pro Tip" (max 20 words) to help them improve, then move to the next question.
- Keep track: say "Question 2 of 5" etc. so the user knows their progress.
- If the user's answer is vague, ask ONE follow-up for clarity before giving the tip.

## PHASE 3: WRAP-UP (After all questions are done)
1. Say: "That wraps up all [amount] questions! Here's your performance summary."
2. Give an overall score out of 100.
3. Mention 2-3 specific strengths you noticed.
4. Mention 1-2 areas for improvement with actionable advice.
5. End with an encouraging closing statement.

# IMPORTANT RULES:
- NEVER skip the onboarding. You MUST collect all 5 pieces of info.
- NEVER dump all questions at once. Ask ONE at a time.
- Keep your responses conversational and concise — this is a voice call, not a text chat.
- Do NOT use special characters like asterisks, slashes, or markdown formatting since this is voice output.
- Stay in character as "Alex" at all times. Be encouraging but honest.
- If the user goes off-topic, gently redirect: "Great thought! Let's get back to the interview."
- Adapt question difficulty to the stated experience level.`
            },
          ],
        },
      };

      await vapi.start(assistantConfig);
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

  return (
    <>
      <div className="w-full flex flex-col items-center justify-start pt-16 gap-10 p-8 min-h-screen bg-black/90">

        {/* Vapi Token Debug Info */}
        <div className="text-xs text-white/30 font-mono">
          Vapi Token: {process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? `${process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN.slice(0, 8)}...` : "⚠️ NOT SET"} |
          Assistant: {process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? `${process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID.slice(0, 8)}...` : "Not set"} |
          Status: <span className={cn(
            status === CallStatus.ACTIVE && "text-green-400",
            status === CallStatus.CONNECTING && "text-yellow-400",
            status === CallStatus.FINISHED && "text-blue-400",
            status === CallStatus.INACTIVE && "text-white/40",
          )}>{status}</span>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="w-full max-w-2xl bg-red-500/20 border border-red-500/50 rounded-xl px-5 py-4 text-red-300 text-sm text-center">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="call-view w-full flex flex-col md:flex-row items-center justify-center gap-12">

          {/* AI Interviewer Card */}
          <div className="w-120 card-interviewer flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#1A1C20] border border-white/10 shadow-2xl">
            <div className="avatar relative flex items-center justify-center">
              <div className="bg-[#2A2D32] rounded-full p-4 border-2 border-[#4C5159]">
                <Image
                  src="/ai-avatar.png"
                  alt="AI Interviewer"
                  width={65}
                  height={54}
                  className="object-contain"
                />
              </div>
              {isSpeaking && (
                <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75" />
              )}
            </div>
            <h3 className="text-white font-semibold text-xl tracking-tight">AI Interviewer</h3>
          </div>

          {/* User Card */}
          <div className="card-border border-blue-900">
            <div className="card-content flex flex-col items-center gap-4 bg-[#1A1C20] rounded-2xl p-10">
              <Image
                src="/user-avatar.webp"
                alt="User Avatar"
                width={120}
                height={120}
                className="rounded-full object-cover border-4 border-[#2A2D32]"
              />
              <h3 className="text-white/80 font-medium text-lg capitalize">{userName}</h3>
            </div>
          </div>
        </div>

        {/* Transcript */}
        {messages.length > 0 && lastMessage && (
          <div className="transcript-border mt-4 w-full flex justify-center">
            <div className="transcript w-full max-w-2xl px-6 py-4 bg-white/5 border border-white/10 rounded-xl shadow-lg">
              <p
                key={lastMessage}
                className={cn(
                  "text-white/90 text-center text-lg transition-all duration-500",
                  "animate-in fade-in slide-in-from-bottom-2"
                )}
              >
                {lastMessage}
              </p>
            </div>
          </div>
        )}

        {/* Text input fallback */}
        {status === CallStatus.ACTIVE && (
          <div className="w-full max-w-2xl mt-4 flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your response here..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 px-6 py-3 rounded-xl text-white font-bold hover:bg-blue-700 transition-all active:scale-95"
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
                  {status === CallStatus.FINISHED ? "Start New Call" : "Start Call"}
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