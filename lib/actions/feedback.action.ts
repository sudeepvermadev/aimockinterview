"use server";

import { adminDb } from "@/firebase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;
if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

export const saveDetailedFeedback = async (interviewId: string, userId: string, transcript: any[]) => {
  try {
    let analysis;
    if (genAI && transcript && transcript.length > 0) {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        // @ts-ignore
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      // Format transcript for the prompt
      let formattedTranscript = "";
      for (const turn of transcript) {
        if (turn.role === "assistant" || turn.role === "model") {
          formattedTranscript += `\nQuestion (AI): ${turn.content}`;
        } else if (turn.role === "user") {
          formattedTranscript += `\nAnswer (User): ${turn.content}`;
        }
      }

      const prompt = `
      You are a high-level executive technical examiner. Evaluate the candidate's performance based on the provided interview transcript.

      Transcript:
      ${formattedTranscript}

      Your task is to analyze the user's answers, generate an ideal technical answer for each question, and evaluate the user's response.

      Evaluation Rules:
      1. **FAIR SCORING LOGIC**: 
         - Full Marks: Conceptually accurate and technically complete.
         - Partial Marks (40-80%): If they mentioned key terms but missed depth.
         - Low Marks (10-30%): Extremely vague but on topic.
         - 0 Marks: Completely wrong or irrelevant.
      2. For each question:
         - Provide the 'question' asked.
         - Provide the 'userResponse'.
         - Provide a comprehensive 'correctAnswer'.
         - Provide actionable 'feedback'.
         - Award 'marksAwarded' out of 100.

      Return STRICTLY valid JSON with this structure:
      {
        "totalScore": <overall score out of 100>,
        "finalAssessment": "<A 2-3 sentence executive summary of performance>",
        "comparisons": [
          {
            "question": "<The question>",
            "userResponse": "<The user's answer>",
            "correctAnswer": "<The ideal answer>",
            "feedback": "<Specific feedback>",
            "marksAwarded": <Score out of 100>
          }
        ]
      }
      `;

      try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        responseText = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
        analysis = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse Gemini JSON output:", e);
      }
    }

    if (!analysis) {
        analysis = {
            totalScore: 0,
            finalAssessment: "Evaluation could not be processed completely due to insufficient data or an AI processing error.",
            comparisons: [],
        };
    }

    // Add timestamp and the raw transcript
    analysis.createdAt = new Date().toISOString();
    analysis.transcript = transcript || [];
    analysis.isPublic = false;

    // 2. Save detailed feedback
    const savedDoc = await adminDb.collection("feedback").add({
      interviewId,
      userId,
      ...analysis
    });

    // 3. Mark interview as finalized so it shows score on Home
    await adminDb.collection("interviews").doc(interviewId).update({
      finalized: true
    });

    return { success: true, feedbackId: savedDoc.id };
  } catch (error) {
    console.error("Error saving detailed feedback:", error);
    return { success: false };
  }
};