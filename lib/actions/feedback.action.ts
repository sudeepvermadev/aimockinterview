"use server";

import { adminDb } from "@/firebase/admin";

export const saveDetailedFeedback = async (interviewId: string, userId: string, transcript: any[]) => {
  try {
    // 1. Here you would normally send the transcript to Gemini/OpenAI
    // For now, we structure the data for your Feedback Page comparison
    const analysis = {
      totalScore: 82,
      finalAssessment: "Your explanation of React Hooks was solid, but your NodeJS middleware logic needs more detail.",
      // This matches the UI needs for "Your Answer vs AI Answer"
      comparisons: [
        {
          question: "How do hooks work?",
          userAnswer: "They let you use state in functions.",
          aiIdealAnswer: "Hooks allow function components to hook into React state and lifecycle features without classes.",
          feedback: "Add mention of the Fiber architecture for a 'Senior' level answer."
        }
      ],
      createdAt: new Date().toISOString(),
    };

    // 2. Save detailed feedback
    await adminDb.collection("feedback").add({
      interviewId,
      userId,
      ...analysis
    });

    // 3. Mark interview as finalized so it shows score on Home
    await adminDb.collection("interviews").doc(interviewId).update({
      finalized: true
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};