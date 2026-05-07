"use client";

import React from "react";
import dayjs from "dayjs";

interface ReportTemplateProps {
  user: any;
  interviewData: any;
  score: number;
}

const C = {
  bg: "#FFFFFF",
  card: "#F8FAFC",
  cardAlt: "#F1F5F9",
  textPrimary: "#0F172A",
  textSecondary: "#334155",
  textMuted: "#64748B",
  blue: "#2563EB",
  blueLight: "#3B82F6",
  blueDark: "#1E40AF",
  emerald: "#059669",
  emeraldLight: "#10B981",
  border: "#E2E8F0",
  borderSoft: "#F1F5F9",
};

const ReportTemplate = React.forwardRef<HTMLDivElement, ReportTemplateProps>(
  ({ user, interviewData, score }, ref) => {
    if (!interviewData) return null;
    const { role, feedback, createdAt } = interviewData;
    const comparisons = (feedback as any)?.comparisons || [];
    const transcript = (feedback as any)?.transcript || [];
    
    const numQuestions = comparisons.length > 0 ? comparisons.length : transcript.filter((m: any) => m.role === 'assistant').length;
    const weightPerQuestion = numQuestions > 0 ? Math.max(1, Math.floor(100 / numQuestions)) : 0;
    const correctCount = comparisons.length > 0 ? comparisons.filter((c: any) => (c.marksAwarded ?? c.score ?? 0) >= (weightPerQuestion * 0.7)).length : Math.floor(numQuestions * (score / 100));

    return (
      <div
        ref={ref}
        style={{
          width: "900px",
          padding: "60px 50px",
          backgroundColor: C.bg,
          color: C.textPrimary,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          lineHeight: 1.6,
          boxSizing: "border-box",
        }}
      >
        {/* TOP SEAL / STAMP (CENTERED) */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "-30px", position: "relative", zIndex: 10 }}>
          <div style={{ 
            width: "120px", 
            height: "120px", 
            borderRadius: "50%", 
            background: "white", 
            padding: "5px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #E2E8F0"
          }}>
            <div style={{ 
              width: "100%", 
              height: "100%", 
              borderRadius: "50%", 
              border: "2px solid #FFD700",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle, #FFF 0%, #F8FAFC 100%)",
              position: "relative"
            }}>
              {/* Wreath / Laurel Leaves (SVG Simulation) */}
              <svg width="90" height="90" viewBox="0 0 100 100" style={{ position: "absolute", opacity: 0.8 }}>
                <path d="M50 85 C20 85 10 60 10 30" fill="none" stroke="#FFD700" strokeWidth="2" />
                <path d="M50 85 C80 85 90 60 90 30" fill="none" stroke="#FFD700" strokeWidth="2" />
              </svg>
              <div style={{ color: "#B8860B", fontSize: "18px", marginBottom: "-5px" }}>★</div>
              <div style={{ fontSize: "10px", fontWeight: 900, color: "#B8860B", textTransform: "uppercase", letterSpacing: "1px" }}>Verified</div>
              <div style={{ fontSize: "8px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Assessment</div>
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${C.blue}`, paddingBottom: "30px", marginBottom: "40px", paddingTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ padding: "12px", borderRadius: "16px", backgroundColor: C.cardAlt, border: `1px solid ${C.border}` }}>
              <img src="/logonew.png" alt="Logo" style={{ height: "50px", width: "45px", objectFit: "contain" }} crossOrigin="anonymous" />
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: C.textPrimary }}>Prep<span style={{ color: C.blue }}>Edge</span></div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "4px" }}>Intelligence Assessment</div>
            </div>
          </div>

          <div style={{ textAlign: "right", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
              <div style={{ fontSize: "20px", fontWeight: 900, color: C.textPrimary }}>{user?.name || "Candidate"}</div>
              {user?.isPro && (
                <span style={{ 
                  padding: "4px 10px", 
                  backgroundColor: "#FFD700", 
                  color: "#B8860B", 
                  fontSize: "10px", 
                  fontWeight: 900, 
                  borderRadius: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  border: "1px solid #B8860B"
                }}>PRO</span>
              )}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.blue }}>{role} Interview</div>
            <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px" }}>{dayjs(createdAt).format("MMMM DD, YYYY")}</div>
          </div>


        </div>

        {/* PERFORMANCE SUMMARY */}
        <div style={{ display: "flex", gap: "40px", marginBottom: "50px", alignItems: "center" }}>
          <div style={{ flex: 1.5 }}>
            <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: "100px", backgroundColor: "rgba(37,99,235,0.08)", color: C.blue, fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "20px" }}>⚡ Executive Appraisal</div>
            <h2 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "15px", color: C.textPrimary }}>Technical Performance Overview</h2>
            <p style={{ fontSize: "14px", color: C.textSecondary, fontWeight: 500, lineHeight: 1.8 }}>
              This document certifies the candidate&apos;s performance during the simulated technical interview. Our AI evaluation engine has analyzed the session across conceptual understanding, technical precision, and communication efficacy.
            </p>
          </div>
          <div style={{ flex: 1, backgroundColor: C.card, borderRadius: "32px", padding: "30px", border: `1px solid ${C.border}`, textAlign: "center" }}>
             <div style={{ fontSize: "10px", fontWeight: 900, color: C.textMuted, textTransform: "uppercase", letterSpacing: "3px", marginBottom: "15px" }}>Performance Index</div>
             <div style={{ position: "relative", width: "130px", height: "130px", margin: "0 auto", borderRadius: "50%", border: `6px solid ${C.cardAlt}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <span style={{ fontSize: "50px", fontWeight: 900, color: C.blue, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted }}>/ 100</span>
             </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "60px" }}>
           <div style={{ flex: 1, padding: "20px", borderRadius: "24px", backgroundColor: C.card, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "10px", fontWeight: 800, color: C.textMuted, textTransform: "uppercase", marginBottom: "8px" }}>Success Rate</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: C.emerald }}>{score}% Accuracy</div>
           </div>
           <div style={{ flex: 1, padding: "20px", borderRadius: "24px", backgroundColor: C.card, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "10px", fontWeight: 800, color: C.textMuted, textTransform: "uppercase", marginBottom: "8px" }}>Resolved Segments</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: C.blue }}>{correctCount} / {numQuestions} Pass</div>
           </div>
        </div>

        {/* APPRAISAL LOG */}
        <div style={{ marginBottom: "60px" }}>
           <h3 style={{ fontSize: "22px", fontWeight: 900, borderLeft: `5px solid ${C.blue}`, paddingLeft: "15px", marginBottom: "30px" }}>Granular Appraisal Log</h3>
           <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              {comparisons.map((pair: any, i: number) => (
                <div key={i} style={{ borderRadius: "24px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
                   <div style={{ padding: "12px 25px", backgroundColor: C.cardAlt, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", color: C.textMuted }}>Question 0{i + 1}</span>
                      <span style={{ fontSize: "10px", fontWeight: 900, color: C.blue }}>Score: {pair.marksAwarded ?? pair.score ?? 0} / {weightPerQuestion}</span>
                   </div>
                   <div style={{ padding: "25px" }}>
                      <h4 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "20px" }}>{pair.question}</h4>
                      <div style={{ display: "flex", gap: "20px" }}>
                         <div style={{ flex: 1, padding: "15px", borderRadius: "16px", backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: "9px", fontWeight: 800, color: C.textMuted, textTransform: "uppercase", marginBottom: "8px" }}>Your Answer</div>
                            <p style={{ fontSize: "11px", fontWeight: 500, color: C.textSecondary, fontStyle: "italic" }}>&quot;{pair.userResponse}&quot;</p>
                         </div>
                         <div style={{ flex: 1, padding: "15px", borderRadius: "16px", backgroundColor: "rgba(5,150,105,0.05)", border: `1px solid rgba(5,150,105,0.1)` }}>
                            <div style={{ fontSize: "9px", fontWeight: 800, color: C.emerald, textTransform: "uppercase", marginBottom: "8px" }}>AI Coach Response</div>
                            <p style={{ fontSize: "11px", fontWeight: 700, color: C.textPrimary }}>{pair.correctAnswer}</p>
                         </div>
                      </div>
                      {pair.feedback && (
                        <div style={{ marginTop: "20px", padding: "15px", borderRadius: "16px", backgroundColor: "rgba(37,99,235,0.05)", border: `1px solid rgba(37,99,235,0.1)` }}>
                           <p style={{ fontSize: "11px", color: C.textSecondary }}><span style={{ fontWeight: 900, color: C.blue }}>Tactical Feedback:</span> {pair.feedback}</p>
                        </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* TRANSCRIPT */}
        {transcript.length > 0 && (
          <div style={{ marginBottom: "60px" }}>
             <h3 style={{ fontSize: "22px", fontWeight: 900, borderLeft: `5px solid ${C.textMuted}`, paddingLeft: "15px", marginBottom: "30px" }}>Interactive Session Transcript</h3>
             <div style={{ backgroundColor: C.cardAlt, borderRadius: "24px", padding: "30px", border: `1px solid ${C.border}` }}>
                {transcript.map((m: any, i: number) => (
                   <div key={i} style={{ marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                      <span style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", color: C.textMuted, marginBottom: "5px" }}>{m.role === "assistant" ? "AI Coach (Alex)" : user?.name || "Candidate"}</span>
                      <div style={{ maxWidth: "80%", padding: "12px 18px", borderRadius: "16px", fontSize: "11px", fontWeight: 500, backgroundColor: m.role === "user" ? C.blue : C.bg, color: m.role === "user" ? "#FFF" : C.textPrimary, border: `1px solid ${C.border}` }}>
                         {m.content}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "30px", textAlign: "center" }}>
           <div style={{ fontSize: "9px", fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: "5px", marginBottom: "5px" }}>Digitally Certified by PrepEdge Infrastructure</div>
           <div style={{ fontSize: "10px", fontWeight: 500, color: C.textMuted }}>© {dayjs().year()} PrepEdge Analytics Engine • ECC-824 Protocol Verified Assessment</div>
        </div>
      </div>
    );
  }
);

ReportTemplate.displayName = "ReportTemplate";

export default ReportTemplate;
