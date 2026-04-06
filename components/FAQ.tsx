"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "What is PrepEdge?",
    answer: "PrepEdge is an AI-powered mock interview platform designed to help you practice real-world interview scenarios and get instant, actionable feedback to boost your confidence."
  },
  {
    question: "What is an AI mock interview, and how does it work?",
    answer: "An AI mock interview uses advanced artificial intelligence to simulate a real-world interview experience. It interactively asks you questions and uses natural language processing to analyze your transcripts and provide a deep performance appraisal."
  },
  {
    question: "Is the AI mock interview practice really free?",
    answer: "Yes, PrepEdge offers free tier access that allows candidates to practice critical interview rounds and access detailed performance analytics without any upfront cost."
  },
  {
    question: "How is PrepEdge's AI mock interview different from other tools?",
    answer: "Unlike generic tools, PrepEdge provides a high-fidelity 'Executive Assessment' that includes sectional scoring, transcribed logs, and specific 'Optimization Paths' for every answer you provide."
  },
  {
    question: "What types of interview questions can I practice?",
    answer: "You can practice a comprehensive array of questions, ranging from technical coding and system design to behavioral questions focused on leadership, teamwork, and problem-solving."
  },
  {
    question: "Can freshers use AI mock interview practice for campus placements?",
    answer: "Absolutely. PrepEdge is specifically designed to help freshers build confidence and master the STAR method—essential for succeeding in competitive campus recruitment drives."
  },
  {
    question: "How detailed is the interview performance feedback?",
    answer: "Our feedback is exceptionally thorough, providing a 1-100 grade point, key strengths, growth areas, and a detailed question-by-question analysis identifying exactly where you can improve."
  },
  {
    question: "Which industries and roles does the AI mock interview support?",
    answer: "PrepEdge supports a wide spectrum of industries including Software Engineering, Product Management, Finance, Data Science, and Marketing, covering roles from junior to executive levels."
  },
  {
    question: "Can I practice mock interviews multiple times for the same role?",
    answer: "Yes, you can retake interviews as many times as you need. Each session is unique, helping you refine your responses and track your grade improvements over time."
  },
  {
    question: "Do I need to upload my resume for the mock interview?",
    answer: "No, uploading a resume is optional. You can jump straight into a practice session by selecting your target role, making it easy to start sharpening your skills immediately."
  },
  {
    question: "How should I prepare before starting an AI mock interview?",
    answer: "Treat it like a real interview: ensure a quiet environment, test your microphone and camera, and review the STAR method. Our platform even includes a Technical Readiness checklist to help you."
  },
  {
    question: "What is the STAR method, and how does the AI evaluate it?",
    answer: "The STAR method (Situation, Task, Action, Result) is the gold standard for behavioral answers. PrepEdge's AI specifically checks if your answers include measurable outcomes and clear descriptions of your specific contributions."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-6 border-t border-[var(--border-subtle)] bg-[var(--surface-primary)]">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">
            Everything you need to know about mastering your next interview.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group relative border border-[var(--border-subtle)] rounded-2xl overflow-hidden transition-all duration-500 backdrop-blur-md ${
                openIndex === index 
                  ? "bg-blue-500/10 border-blue-500/30 shadow-xl shadow-blue-500/10 scale-[1.01]" 
                  : "bg-[var(--search-bg)] hover:bg-white/[0.03] hover:border-blue-500/20 hover:shadow-lg"
              }`}
            >
              {/* FAQ Mesh-Glow Overlay */}
              <div 
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
                    openIndex === index ? "opacity-40" : ""
                }`}
                style={{
                  background: `radial-gradient(circle at left, rgba(59, 130, 246, 0.08), transparent 70%)`
                }}
              />

              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none relative z-10"
              >
                <span className={`text-lg font-semibold transition-colors duration-300 ${
                  openIndex === index ? "text-blue-400" : "text-[var(--text-primary)] group-hover:text-blue-400"
                }`}>
                  {faq.question}
                </span>
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                    openIndex === index ? "bg-blue-500/20 rotate-180" : "bg-white/5 group-hover:bg-blue-500/10"
                }`}>
                    <ChevronDown className={`w-5 h-5 shrink-0 ${
                      openIndex === index ? "text-blue-400" : "text-[var(--text-secondary)] group-hover:text-blue-400"
                    }`} />
                </div>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out relative z-10 ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 pt-0 text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] font-medium">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
