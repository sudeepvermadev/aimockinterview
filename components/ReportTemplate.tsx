"use client";

import React from "react";
import dayjs from "dayjs";

interface ReportTemplateProps {
  user: any;
  interviewData: any;
  score: number;
}

const C = {
  bg: "#020617",
  card: "#0f172a",
  cardAlt: "#1e293b",
  white: "#ffffff",
  gray: "#94a3b8",
  muted: "#64748b",
  blue: "#3b82f6",
  blueLight: "#60a5fa",
  blueDark: "#2563eb",
  emerald: "#10b981",
  emeraldLight: "#34d399",
  amber: "#f59e0b",
  amberLight: "#fbbf24",
  border: "rgba(255,255,255,0.1)",
  borderSoft: "rgba(255,255,255,0.05)",
};

const ReportTemplate = React.forwardRef<HTMLDivElement, ReportTemplateProps>(
  ({ user, interviewData, score }, ref) => {
    const { role, feedback, createdAt } = interviewData;
    const comparisons = (feedback as any)?.comparisons || [];
    const transcript = (feedback as any)?.transcript || [];

    return (
      <div
        ref={ref}
        style={{
          width: "900px",
          padding: "56px 52px",
          backgroundColor: C.bg,
          color: C.white,
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          lineHeight: 1.6,
          boxSizing: "border-box",
        }}
      >
        {/* ──────── HEADER ──────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "28px",
            marginBottom: "36px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                padding: "10px",
                borderRadius: "14px",
                border: `1px solid ${C.border}`,
                backgroundColor: C.borderSoft,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logonew.png"
                alt="PrepEdge"
                style={{ height: "42px", width: "38px", objectFit: "contain", display: "block" }}
                crossOrigin="anonymous"
              />
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px" }}>
                Prep<span style={{ color: C.blue }}>Edge</span>
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                  marginTop: "2px",
                }}
              >
                Professional Assessment Report
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: C.gray,
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "4px",
              }}
            >
              Generated For
            </div>
            <div style={{ fontSize: "18px", fontWeight: 900 }}>{user?.name || "Candidate"}</div>
            <div style={{ fontSize: "12px", color: C.muted, marginTop: "4px" }}>
              {dayjs(createdAt).format("MMMM DD, YYYY")}
            </div>
          </div>
        </div>

        {/* ──────── EXECUTIVE SUMMARY + SCORE ──────── */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          {/* Left: Summary Text */}
          <div style={{ flex: 2 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "100px",
                fontSize: "9px",
                fontWeight: 900,
                textTransform: "uppercase" as const,
                letterSpacing: "1.5px",
                backgroundColor: "rgba(37,99,235,0.1)",
                color: C.blueLight,
                border: `1px solid rgba(37,99,235,0.2)`,
                marginBottom: "16px",
              }}
            >
              ⚡ Executive Analysis
            </div>

            <div
              style={{
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                marginBottom: "12px",
              }}
            >
              Interview Overview: {role}
            </div>

            <p
              style={{
                fontSize: "13px",
                color: C.gray,
                lineHeight: 1.7,
                fontWeight: 500,
                marginBottom: "20px",
              }}
            >
              This report provides a comprehensive evaluation of your performance during the mock
              interview. Our AI engine has analyzed your responses across technical accuracy,
              communication clarity, and role-specific alignment.
            </p>

            {/* Info Grid */}
            <div style={{ display: "flex", gap: "14px" }}>
              <div
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: "14px",
                  backgroundColor: C.borderSoft,
                  border: `1px solid ${C.borderSoft}`,
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: "4px",
                  }}
                >
                  Interview Type
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700 }}>{role}</div>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: "14px",
                  backgroundColor: C.borderSoft,
                  border: `1px solid ${C.borderSoft}`,
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: "4px",
                  }}
                >
                  Result Status
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: score >= 80 ? C.emeraldLight : C.blueLight,
                  }}
                >
                  {score >= 80 ? "Highly Recommended" : "Recommended for Review"}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Score Circle */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center",
              justifyContent: "center",
              padding: "28px",
              borderRadius: "28px",
              backgroundColor: "rgba(37,99,235,0.05)",
              border: `1px solid rgba(37,99,235,0.2)`,
            }}
          >
            <div
              style={{
                fontSize: "9px",
                fontWeight: 900,
                color: C.gray,
                textTransform: "uppercase",
                letterSpacing: "3px",
                marginBottom: "14px",
              }}
            >
              Overall Score
            </div>
            <div
              style={{
                position: "relative",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: `4px solid rgba(37,99,235,0.3)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "44px", fontWeight: 900 }}>{score}</span>
              <div
                style={{
                  position: "absolute",
                  bottom: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "3px 14px",
                  borderRadius: "20px",
                  fontSize: "8px",
                  fontWeight: 900,
                  textTransform: "uppercase" as const,
                  backgroundColor: C.blueDark,
                  color: C.white,
                }}
              >
                / 100
              </div>
            </div>
          </div>
        </div>

        {/* ──────── STRENGTHS · GROWTH · INSIGHTS (3-col) ──────── */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          {/* Strengths */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: C.emeraldLight,
                marginBottom: "10px",
              }}
            >
              <span style={{ fontSize: "14px" }}>🏆</span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Strengths
              </span>
            </div>
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                minHeight: "120px",
                backgroundColor: "rgba(16,185,129,0.05)",
                border: `1px solid rgba(16,185,129,0.1)`,
              }}
            >
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                <li
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: C.gray,
                    marginBottom: "10px",
                    paddingLeft: "12px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      color: C.emerald,
                      fontWeight: 900,
                    }}
                  >
                    •
                  </span>
                  Strong role alignment and domain knowledge.
                </li>
                <li
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: C.gray,
                    paddingLeft: "12px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      color: C.emerald,
                      fontWeight: 900,
                    }}
                  >
                    •
                  </span>
                  Clear and structured communication.
                </li>
              </ul>
            </div>
          </div>

          {/* Growth */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: C.amberLight,
                marginBottom: "10px",
              }}
            >
              <span style={{ fontSize: "14px" }}>🎯</span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Growth Areas
              </span>
            </div>
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                minHeight: "120px",
                backgroundColor: "rgba(245,158,11,0.05)",
                border: `1px solid rgba(245,158,11,0.1)`,
              }}
            >
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                <li
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: C.gray,
                    marginBottom: "10px",
                    paddingLeft: "12px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{ position: "absolute", left: 0, color: C.amber, fontWeight: 900 }}
                  >
                    •
                  </span>
                  Quantify achievements with metrics.
                </li>
                <li
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: C.gray,
                    paddingLeft: "12px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{ position: "absolute", left: 0, color: C.amber, fontWeight: 900 }}
                  >
                    •
                  </span>
                  Reduce technical ambiguity in explanations.
                </li>
              </ul>
            </div>
          </div>

          {/* AI Insights */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: C.blueLight,
                marginBottom: "10px",
              }}
            >
              <span style={{ fontSize: "14px" }}>📊</span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                AI Insights
              </span>
            </div>
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                minHeight: "120px",
                backgroundColor: "rgba(37,99,235,0.05)",
                border: `1px solid rgba(37,99,235,0.1)`,
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  fontStyle: "italic",
                  color: C.gray,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                &ldquo;Your confidence level is in the top 15% of candidates for {role} roles.
                Continue practicing to reach the elite tier.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* ──────── DETAILED BREAKDOWN ──────── */}
        {comparisons.length > 0 && (
          <div style={{ marginBottom: "48px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  width: "5px",
                  height: "24px",
                  borderRadius: "6px",
                  backgroundColor: C.blueDark,
                }}
              />
              <div style={{ fontSize: "20px", fontWeight: 900 }}>Detailed Breakdown</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {comparisons.map((pair: any, i: number) => (
                <div
                  key={i}
                  style={{
                    border: `1px solid ${C.borderSoft}`,
                    borderRadius: "20px",
                    overflow: "hidden",
                    backgroundColor: "rgba(255,255,255,0.02)",
                  }}
                >
                  {/* Question header bar */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 24px",
                      backgroundColor: C.borderSoft,
                      fontSize: "9px",
                      fontWeight: 900,
                      textTransform: "uppercase" as const,
                      letterSpacing: "2px",
                      color: C.muted,
                    }}
                  >
                    <span>Question {i + 1}</span>
                    <span style={{ color: C.blueLight }}>
                      Section Score: {pair.score || "N/A"}
                    </span>
                  </div>

                  {/* Question body */}
                  <div style={{ padding: "28px 24px" }}>
                    {/* Question text */}
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        lineHeight: 1.5,
                        marginBottom: "16px",
                      }}
                    >
                      {pair.question}
                    </p>

                    {/* User answer */}
                    <div
                      style={{
                        position: "relative",
                        padding: "20px 22px",
                        borderRadius: "14px",
                        backgroundColor: C.card,
                        border: `1px solid ${C.borderSoft}`,
                        marginBottom: "20px",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "-8px",
                          left: "20px",
                          padding: "2px 10px",
                          fontSize: "8px",
                          fontWeight: 900,
                          textTransform: "uppercase" as const,
                          letterSpacing: "2px",
                          backgroundColor: C.bg,
                          color: C.blueLight,
                        }}
                      >
                        Response
                      </span>
                      <p
                        style={{
                          fontSize: "12px",
                          fontStyle: "italic",
                          fontWeight: 600,
                          color: C.gray,
                          lineHeight: 1.7,
                          margin: 0,
                        }}
                      >
                        &ldquo;{pair.userAnswer}&rdquo;
                      </p>
                    </div>

                    {/* Strength + Weakness side-by-side */}
                    <div style={{ display: "flex", gap: "14px" }}>
                      <div
                        style={{
                          flex: 1,
                          padding: "16px 18px",
                          borderRadius: "14px",
                          backgroundColor: "rgba(16,185,129,0.05)",
                          border: `1px solid rgba(16,185,129,0.1)`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "8px",
                            fontWeight: 900,
                            color: C.emeraldLight,
                            textTransform: "uppercase" as const,
                            letterSpacing: "2px",
                            marginBottom: "8px",
                          }}
                        >
                          Impact
                        </div>
                        <p
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {pair.strength}
                        </p>
                      </div>

                      <div
                        style={{
                          flex: 1,
                          padding: "16px 18px",
                          borderRadius: "14px",
                          backgroundColor: "rgba(245,158,11,0.05)",
                          border: `1px solid rgba(245,158,11,0.1)`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "8px",
                            fontWeight: 900,
                            color: C.amberLight,
                            textTransform: "uppercase" as const,
                            letterSpacing: "2px",
                            marginBottom: "8px",
                          }}
                        >
                          Refinement
                        </div>
                        <p
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {pair.weakness}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────── INTERVIEW MASTERY (PREP GUIDANCE) ──────── */}
        <div style={{ paddingTop: "32px", borderTop: `1px solid ${C.border}`, marginBottom: "48px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "5px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: C.emerald,
              }}
            />
            <div style={{ fontSize: "20px", fontWeight: 900 }}>Interview Mastery Guide</div>
          </div>

          {/* STAR Method */}
          <div
            style={{
              backgroundColor: "rgba(16,185,129,0.03)",
              border: `1px solid rgba(16,185,129,0.1)`,
              borderRadius: "24px",
              padding: "28px",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 900, color: C.emeraldLight, marginBottom: "12px" }}>
              The STAR Method Strategy
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              {[
                { l: "S", t: "Situation", c: C.blueLight },
                { l: "T", t: "Task", c: C.emeraldLight },
                { l: "A", t: "Action", c: C.amberLight },
                { l: "R", t: "Result", c: "#fb7185" },
              ].map((item, idx) => (
                <div key={idx} style={{ flex: 1, padding: "14px", borderRadius: "16px", backgroundColor: C.bg, border: `1px solid ${C.borderSoft}` }}>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: item.c, marginBottom: "4px" }}>{item.l}</div>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: C.white }}>{item.t}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: C.gray, fontWeight: 500, fontStyle: "italic" }}>
              "Increased productivity by 35% using agile" &gt; "I helped the team work better."
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            {/* Tech Readiness */}
            <div style={{ flex: 1, backgroundColor: C.borderSoft, borderRadius: "24px", padding: "24px", border: `1px solid ${C.borderSoft}` }}>
              <div style={{ fontSize: "12px", fontWeight: 900, color: C.blueLight, marginBottom: "16px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>
                Technical Readiness
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Camera: Eye level, good lighting",
                  "Mic: High-quality audio/headphones",
                  "Internet: Stable & high speed",
                  "Backup: Hotspot & spare device",
                ].map((text, i) => (
                  <div key={i} style={{ fontSize: "11px", fontWeight: 600, color: C.gray, display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: C.blueLight }}>✓</span> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Behavioral Stories */}
            <div style={{ flex: 1, backgroundColor: C.borderSoft, borderRadius: "24px", padding: "24px", border: `1px solid ${C.borderSoft}` }}>
              <div style={{ fontSize: "12px", fontWeight: 900, color: "#818cf8", marginBottom: "16px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>
                Behavioral Core
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {[
                  "Leadership", "Problem-solving", "Conflict", "Ownership", "Failure", "Adapting"
                ].map((skill, i) => (
                  <div key={i} style={{ padding: "4px 10px", borderRadius: "8px", backgroundColor: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", fontSize: "10px", fontWeight: 800, color: "#a5b4fc" }}>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ──────── TRANSCRIPT ──────── */}
        {transcript.length > 0 && (
          <div style={{ marginBottom: "48px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "28px",
                paddingTop: "32px",
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  width: "5px",
                  height: "24px",
                  borderRadius: "6px",
                  backgroundColor: C.muted,
                }}
              />
              <div style={{ fontSize: "20px", fontWeight: 900 }}>Interactive Log</div>
            </div>

            <div
              style={{
                padding: "28px 24px",
                borderRadius: "20px",
                backgroundColor: "rgba(15,23,42,0.6)",
                border: `1px solid ${C.borderSoft}`,
              }}
            >
              {transcript.map((turn: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column" as const,
                    alignItems: turn.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: i < transcript.length - 1 ? "18px" : 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "8px",
                      fontWeight: 900,
                      color: C.muted,
                      textTransform: "uppercase" as const,
                      letterSpacing: "3px",
                      marginBottom: "4px",
                      paddingLeft: turn.role === "user" ? 0 : "12px",
                      paddingRight: turn.role === "user" ? "12px" : 0,
                    }}
                  >
                    {turn.role === "assistant" ? "System Agent" : user?.name || "Participant"}
                  </span>
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "14px 20px",
                      borderRadius:
                        turn.role === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      fontSize: "12px",
                      lineHeight: 1.65,
                      fontWeight: 600,
                      ...(turn.role === "user"
                        ? {
                            backgroundColor: C.blueDark,
                            color: C.white,
                          }
                        : {
                            backgroundColor: C.borderSoft,
                            border: `1px solid ${C.border}`,
                            color: C.gray,
                          }),
                    }}
                  >
                    {turn.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────── FOOTER ──────── */}
        <div
          style={{
            paddingTop: "28px",
            borderTop: `1px solid ${C.border}`,
            textAlign: "center" as const,
          }}
        >
          <div
            style={{
              fontSize: "8px",
              fontWeight: 900,
              color: C.muted,
              textTransform: "uppercase" as const,
              letterSpacing: "5px",
              marginBottom: "8px",
            }}
          >
            AUTHENTICATED PREPEDGE INTELLIGENCE ASSESSMENT
          </div>
          <div style={{ fontSize: "9px", fontWeight: 600, color: C.muted }}>
            © {dayjs().year()} PrepEdge Analytics Engine • Confidential Candidate Report
          </div>
        </div>
      </div>
    );
  }
);

ReportTemplate.displayName = "ReportTemplate";

export default ReportTemplate;
