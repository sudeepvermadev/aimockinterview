"use server";

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

const jobBoostSchema = z.object({
  questions: z.array(z.string()).min(5).max(10),
  role: z.string(),
  focus: z.string(),
  techstack: z.array(z.string()),
});

export async function generateJobSpecificQuestions(jdText: string) {
  if (!jdText || jdText.length < 50) {
    return { success: false, error: "Please provide a more detailed job description (minimum 50 characters)." };
  }

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: jobBoostSchema,
      prompt: `
        Analyze the following Job Description (JD) and extract the most relevant information to prepare a candidate for a mock interview.
        JD Text:
        ${jdText}

        Your task:
        1. Identify the primary **Role** (e.g., Senior React Developer).
        2. Identify the **Focus** (Technical, Behavioral, or Mixed).
        3. Extract the key **Tech Stack** or keywords from the JD.
        4. Generate exactly 5-8 **High-Impact Interview Questions** that a recruiter for this specific job would likely ask.
        Ensure the questions are challenging and directly related to the JD.
      `,
      system: "You are an Elite Technical Recruiter specialized in identifying top talent from job descriptions. Your goal is to prepare candidates by generating high-quality, relevant interview questions.",
    });

    return { 
      success: true, 
      data: {
        ...object,
        type: "Technical" // Defaulting to Technical for UI consistency
      }
    };
  } catch (error) {
    console.error("❌ Job Boost Generation Error:", error);
    return { success: false, error: "Failed to analyze the JD. Please try again with different text." };
  }
}
