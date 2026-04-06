"use server";

import { adminDb } from "@/firebase/admin";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { feedbackSchema } from "@/constants";
import { updateUserStreak } from "./auth.action";
import { checkAchievements } from "./achievements.action";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

export async function createFeedback(params: { interviewId: string; userId: string; transcript: any[]; feedbackId?: string }) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    if (!formattedTranscript || transcript.length === 0) {
      console.warn("⚠️ Empty transcript provided to createFeedback.");
      return { success: false, error: "No user speech detected in the session." };
    }

    console.log("📝 Generating feedback for transcript length:", transcript.length);

    try {
      const { object } = await generateObject({
        model: google("gemini-1.5-flash"),
        schema: feedbackSchema,
        prompt: `
          You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
          Transcript:
          ${formattedTranscript}

          Please score the candidate from 0 to 100 in the following areas. You MUST use these exact categories for each object in the 'categoryScores' array:
          - **Communication Skills**: Clarity, articulation, structured responses.
          - **Technical Knowledge**: Understanding of key concepts for the role.
          - **Problem Solving**: Ability to analyze problems and propose solutions.
          - **Cultural Fit**: Alignment with company values and job role.
          - **Confidence and Clarity**: Confidence in responses, engagement, and clarity.

          Additionally, perform a deep **Vocal and Confidence Analysis**:
          - **confidenceScore**: An overall score (0-100) specifically for their vocal delivery and decisiveness.
          - **fillerWordCount**: Total count of "um", "uh", "like", "you know", "err".
          - **pacing**: Evaluate if they speak 'Slow', 'Steady', or 'Fast'.
          - **topFillerWords**: Array of the most frequent filler words found.
          - **confidenceLevel**: A short string label (e.g., 'High', 'Moderate', 'Developing').
          - **confidenceAnalysis**: A 2-3 sentence technical critique of their vocal confidence and how it affects their professional presence.

          The 'totalScore' should be an integer representing the overall performance.
          Additionally, you MUST provide a detailed "comparisons" array analyzing EACH question asked by the assistant.
          For each question, extract:
          - question: The exact question asked by the assistant.
          - userAnswer: The candidate's response.
          - idealAnswer: What a perfect or highly improved response would be.
          - strength: What they did well.
          - weakness: What could be improved.
          - score: A score for this specific answer out of 100.
          `,
        system:
          "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories and provide a comprehensive comparison of their answers against ideal answers.",
      });

      const feedback = {
        interviewId,
        userId: userId || "vapi-session",
        totalScore: object.totalScore || 0,
        categoryScores: object.categoryScores || [],
        strengths: object.strengths || [],
        areasForImprovement: object.areasForImprovement || [],
        finalAssessment: object.finalAssessment || "No assessment generated.",
        confidenceScore: object.confidenceScore || 0,
        vocalAnalysis: {
          fillerWordCount: object.vocalAnalysis?.fillerWordCount || 0,
          pacing: object.vocalAnalysis?.pacing || "Steady",
          topFillerWords: object.vocalAnalysis?.topFillerWords || [],
          confidenceLevel: object.vocalAnalysis?.confidenceLevel || "Moderate",
        },
        confidenceAnalysis: object.confidenceAnalysis || "No confidence analysis available.",
        comparisons: object.comparisons || [],
        transcript,
        createdAt: new Date().toISOString(),
      };

      let fbRef;
      if (feedbackId) {
        fbRef = adminDb.collection("feedback").doc(feedbackId);
        await fbRef.set(feedback, { merge: true });
      } else {
        fbRef = await adminDb.collection("feedback").add(feedback);
      }

      // Mark interview as finalized so it shows buttons on dashboard
      await adminDb.collection("interviews").doc(interviewId).update({ finalized: true });

      // Update User Streak & Achievements
      if (userId && userId !== "vapi-session") {
        await updateUserStreak(userId);
        await checkAchievements(userId);
      }

      console.log("✅ Feedback saved successfully:", fbRef.id);
      return { success: true, feedbackId: fbRef.id };
    } catch (aiError: any) {
      console.error("❌ Gemini Feedback Generation Error, falling back to default:", aiError);
      
      // Fallback: Generate a default feedback object if the AI fails
      const fallbackFeedback = {
        interviewId,
        userId: userId || "vapi-session",
        totalScore: 60, // Default base score
        categoryScores: [
          { name: "Communication Skills", score: 60, comment: "AI analysis currently unavailable." },
          { name: "Technical Knowledge", score: 60, comment: "AI analysis currently unavailable." },
          { name: "Problem Solving", score: 60, comment: "AI analysis currently unavailable." },
          { name: "Cultural Fit", score: 60, comment: "AI analysis currently unavailable." },
          { name: "Confidence and Clarity", score: 60, comment: "AI analysis currently unavailable." },
        ],
        strengths: ["Session successfully completed and saved."],
        areasForImprovement: ["AI analysis was busy. Retake the interview for detailed feedback."],
        finalAssessment: "Your interview transcript was captured successfully, but the AI service is currently at capacity or hit a rate limit. You can still view your transcript on the feedback page.",
        comparisons: [],
        transcript,
        createdAt: new Date().toISOString(),
      };

      try {
        const fbRef = await adminDb.collection("feedback").add(fallbackFeedback);
        await adminDb.collection("interviews").doc(interviewId).update({ finalized: true });
        
        // Update User Streak & Achievements (Even for fallback)
        if (userId && userId !== "vapi-session") {
          await updateUserStreak(userId);
          await checkAchievements(userId);
        }
        
        console.log("⚠️ Fallback feedback saved successfully:", fbRef.id);
        return { success: true, feedbackId: fbRef.id, isFallback: true };
      } catch (error: any) {
        console.error("❌ Critical Error: Could not even save fallback feedback:", error);
        return { success: false, error: "System error: Failed to save interview session." };
      }
    }
  } catch (error) {
    console.error("❌ Error in createFeedback action:", error);
    return { success: false, error: "Server error occurred during feedback generation." };
  }
}

export async function getInterviewById(id: string): Promise<any> {
  try {
    const interview = await adminDb.collection("interviews").doc(id).get();
    if (!interview.exists) return null;
    return { id: interview.id, ...interview.data() };
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

export async function getFeedbackByInterviewId(params: { interviewId: string; userId: string }) {
  const { interviewId, userId } = params;

  try {
    const querySnapshot = await adminDb
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .limit(1)
      .get();

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

export async function getInterviewsByUserId(userId: string) {
  try {
    const interviewsQuery = await adminDb
      .collection("interviews")
      .where("userId", "==", userId)
      // .orderBy("createdAt", "desc") // Removed to bypass Firebase Composite Index Error
      .get();

    const interviews = interviewsQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort in memory to avoid the composite index requirement
    interviews.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending
    });

    return interviews;
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return [];
  }
}

export async function getLatestInterviews({ userId, limit = 20 }: { userId: string, limit?: number }) {
  try {
    const interviews = await adminDb
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .where("finalized", "==", true)
      .where("userId", "!=", userId)
      .limit(limit)
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return [];
  }
}

export async function submitReview(params: { userId: string; rating: number; message: string; username: string }) {
  const { userId, rating, message, username } = params;

  try {
    const review = {
      userId,
      username,
      rating,
      message,
      createdAt: new Date().toISOString(),
    };

    const reviewRef = await adminDb.collection("reviews").add(review);
    console.log("✅ Review submitted successfully:", reviewRef.id);
    return { success: true, reviewId: reviewRef.id };
  } catch (error) {
    console.error("❌ Error submitting review:", error);
    return { success: false, error: "Failed to submit review." };
  }
}

export async function getTotalUserCount() {
  try {
    const snapshot = await adminDb.collection("users").get();
    return snapshot.size;
  } catch (error) {
    console.error("❌ Error fetching user count:", error);
    return 0;
  }
}

export async function getUserAnalytics(userId: string) {
  try {
    const feedbackSnapshot = await adminDb
      .collection("feedback")
      .where("userId", "==", userId)
      .get();

    const feedbacks = feedbackSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Format for Score Trend (Line Chart)
    const scoreTrend = feedbacks.map((fb: any) => ({
      date: new Date(fb.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: fb.totalScore,
    }));

    // Format for Skill Breakdown (Radar Chart - Average across all)
    const skillMap: Record<string, { total: number; count: number }> = {};
    feedbacks.forEach((fb: any) => {
      fb.categoryScores?.forEach((cat: any) => {
        if (!skillMap[cat.name]) skillMap[cat.name] = { total: 0, count: 0 };
        skillMap[cat.name].total += cat.score;
        skillMap[cat.name].count += 1;
      });
    });

    const skillBreakdown = Object.entries(skillMap).map(([name, data]) => ({
      subject: name,
      A: Math.round(data.total / data.count),
      fullMark: 100,
    }));

    return {
      scoreTrend,
      skillBreakdown,
      totalInterviews: feedbacks.length,
      highestScore: Math.max(...feedbacks.map((fb: any) => fb.totalScore), 0),
      averageScore: feedbacks.length > 0 
        ? Math.round(feedbacks.reduce((acc: number, fb: any) => acc + fb.totalScore, 0) / feedbacks.length) 
        : 0,
    };
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    return null;
  }
}

export async function toggleFeedbackVisibility(feedbackId: string, isPublic: boolean) {
  try {
    await adminDb.collection("feedback").doc(feedbackId).update({ isPublic });
    return { success: true };
  } catch (error) {
    console.error("❌ Error toggling feedback visibility:", error);
    return { success: false };
  }
}

export async function getPublicFeedbackById(feedbackId: string) {
  try {
    const doc = await adminDb.collection("feedback").doc(feedbackId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data?.isPublic) return null;
    return { ...data, id: doc.id };
  } catch (error) {
    console.error("❌ Error fetching public feedback:", error);
    return null;
  }
}

export async function deleteInterview(interviewId: string, userId: string) {
  try {
    // 1. Delete associated feedback
    const feedbackSnapshot = await adminDb
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .get();
    
    const batch = adminDb.batch();
    feedbackSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    
    // 2. Delete the interview
    const interviewRef = adminDb.collection("interviews").doc(interviewId);
    batch.delete(interviewRef);

    await batch.commit();
    console.log("✅ Interview and feedback deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting interview:", error);
    return { success: false, error: "Failed to delete interview." };
  }
}

export async function getStreakHistory(userId: string) {
  try {
    const feedbackSnapshot = await adminDb
      .collection("feedback")
      .where("userId", "==", userId)
      .get();
      
    const activeDates = new Set();
    feedbackSnapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      if (data.createdAt) {
        activeDates.add(data.createdAt.split('T')[0]);
      }
    });

    const history = [];
    // Last 7 days starting from today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      history.push({
        date: iso,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0), // M, T, W...
        isActive: activeDates.has(iso)
      });
    }

    return history;
  } catch (error) {
    console.error("❌ Error fetching streak history:", error);
    return [];
  }
}
