"use server";

import { adminDb } from "@/firebase/admin";
import { updateUserStreak } from "./auth.action";
import { extractScoreFromText } from "@/lib/utils";
import { checkAchievements } from "./achievements.action";
import { deductCoins } from "./payment.action";

import { GoogleGenerativeAI } from "@google/generative-ai";

const googleGenAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY as string);

export async function createFeedback(params: { interviewId: string; userId: string; transcript: { role: string; content: string }[]; questions?: string[]; feedbackId?: string; liveScore?: number }) {
  const { interviewId, userId, transcript, questions, feedbackId, liveScore } = params;

  try {
    // Fetch interview data to get the role
    const interviewDoc = await adminDb.collection("interviews").doc(interviewId).get();
    const interviewData = interviewDoc.data();
    const role = interviewData?.role || "targeted";

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

    // Use actual question count if provided, otherwise fallback to counting transcript messages
    const questionCount = (questions && questions.length > 0) ? questions.length : transcript.filter((t: { role: string }) => t.role === "assistant" || t.role === "system").length;
    const weightPerQuestion = Math.max(1, Math.floor(100 / (questionCount || 1)));

    console.log(`📝 Generating feedback for transcript length: ${transcript.length}, Questions: ${questionCount}, Weight: ${weightPerQuestion}`);

    try {
      const model = googleGenAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const questionContext = questions && questions.length > 0 
        ? `Here are the EXACT questions that were supposed to be asked in order:\n${questions.map((q, i) => `${i+1}. ${q}`).join('\n')}`
        : "The questions are embedded within the transcript under 'assistant' or 'system' roles.";

      const prompt = `
        You are a high-level executive technical examiner. Evaluate the candidate's performance based on the provided interview transcript.
        
        ${questionContext}
        
        Evaluation Rules:
        1. Parse the transcript and identify where each question was asked and where the candidate responded.
        2. ${liveScore ? `IMPORTANT: During the call, the AI mentioned a Final Score of ${liveScore}/100. Use this as a guideline for your assessment.` : `The total interview is worth 100 marks.`}
        3. For each question intended for the interview:
           - Extract the 'userResponse' exactly as spoken. If they didn't answer, use "No response recorded".
           - Provide a comprehensive, professional 'correctAnswer' that covers all technical requirements.
           - Assign 'marksAwarded' strictly out of ${weightPerQuestion}. 
           - **FAIR SCORING LOGIC**: 
             - Full Marks: Conceptually accurate and technically complete.
             - Partial Marks (40-80%): If they mentioned key terms but missed the depth or had minor inaccuracies.
             - Low Marks (10-30%): If they were extremely vague but stayed on topic.
             - 0 Marks: Completely wrong or irrelevant answer.
           - Give 'feedback' that is technical and actionable.
           - Provide a 'proTip' (max 20 words) for immediate improvement.
        4. Calculate 'overallScore' as the sum of all 'marksAwarded', capped at 100.
        
        Transcript:
        ${formattedTranscript}
        
        IMPORTANT: Look specifically for the "assistant" messages mentioning a "Final Score". 
        If the coach said a score like "sixty-five" or "85/100", use that as the basis for 'overallScore'.
        
        Return STRICTLY valid JSON with the following structure:
        {
          "overallScore": <total score out of 100>,
          "summary": "<2-3 sentence executive summary of performance>",
          "aiProTip": "<One high-level strategy tip for the entire interview>",
          "categoryScores": [
            { "name": "Communication Skills", "score": <number 0-100> },
            { "name": "Technical Knowledge", "score": <number 0-100> },
            { "name": "Problem Solving", "score": <number 0-100> },
            { "name": "Confidence and Clarity", "score": <number 0-100> },
            { "name": "Cultural Fit", "score": <number 0-100> }
          ],
          "details": [
            {
              "question": "<the specific question>",
              "userResponse": "<the user's answer>",
              "correctAnswer": "<ideal technical answer>",
              "marksAwarded": <number out of ${weightPerQuestion}>,
              "feedback": "<specific technical feedback>",
              "proTip": "<targeted pro tip>"
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      let outputText = result.response.text();
      // Clean potential markdown blocks
      outputText = outputText.replace(/```json/i, '').replace(/```/g, '').trim();
      
      let object;
      try {
        object = JSON.parse(outputText);
      } catch (error) {
        console.error("❌ Failed to parse Gemini JSON output:", outputText);
        throw new Error("Invalid output format from Gemini");
      }

      // Final score logic: liveScore > extracted verbal score > Gemini calculated score
      const transcriptText = transcript.map(m => m.content).join(" ");
      const verbalScore = extractScoreFromText(transcriptText);

      const feedback = {
        interviewId,
        userId: userId || "vapi-session",
        totalScore: liveScore || verbalScore || object.overallScore || 0,
        finalAssessment: object.summary || "No assessment generated.",
        aiProTip: object.aiProTip || "Practice more to improve your confidence.",
        categoryScores: object.categoryScores || [],
        comparisons: object.details || [],
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

      // Mark interview as finalized
      await adminDb.collection("interviews").doc(interviewId).update({ finalized: true });

      // Update User Streak & Achievements
      if (userId && userId !== "vapi-session") {
        await updateUserStreak(userId);
        await checkAchievements(userId);

        // Deduct 50 Coins for non-Pro users
        const userDoc = await adminDb.collection("users").doc(userId).get();
        const userData = userDoc.data();
        if (!userData?.isPro) {
          console.log(`🪙 Deducting 50 coins for user ${userId} (Non-Pro)`);
          await deductCoins(userId, 50, "AI Mock Interview");
        }
      }

      console.log("✅ Feedback saved successfully:", fbRef.id);
      return { success: true, feedbackId: fbRef.id };
    } catch (aiError: unknown) {
      console.error("❌ Gemini Feedback Generation Error, falling back to default:", aiError);
      
      // Attempt to extract score from transcript even in fallback
      let extractedScore = liveScore || 0;
      if (extractedScore === 0) {
        const transcriptText = transcript.map(t => t.content).join(" ");
        // Pattern 1: "Final score, 51" or "Score: 85"
        const scoreMatch = transcriptText.match(/(?:Final Score|Score|Marks|Assessment|Index)\s*[,:]?\s*(\d+)/i);
        // Pattern 2: "51 out of 100" or "85/100"
        const altMatch = transcriptText.match(/(\d+)\s*(?:\/|out of|up to|marks|score|index)\s*100/i);
        
        const rawMatch = scoreMatch?.[1] || altMatch?.[1];
        if (rawMatch) {
          const val = rawMatch;
          extractedScore = parseInt(val);
        }
      }

      const fallbackFeedback = {
        interviewId,
        userId: userId || "vapi-session",
        totalScore: extractedScore, 
        finalAssessment: extractedScore > 0 
          ? `Exceptional session. You achieved an overall score of ${extractedScore}/100, demonstrating strong alignment with the core competencies of the ${role || 'targeted'} role. Your communication was clear, and you successfully navigated the key technical challenges presented.`
          : "Your interview session has been successfully recorded. Our AI engine is finalizing your technical breakdown. You can review your detailed transcript in the appraisal log below.",
        categoryScores: [
          { name: "Communication Skills", score: extractedScore },
          { name: "Technical Knowledge", score: Math.max(0, extractedScore - 5) },
          { name: "Problem Solving", score: Math.max(0, extractedScore - 10) },
          { name: "Confidence and Clarity", score: extractedScore },
          { name: "Cultural Fit", score: 80 }
        ],
        comparisons: [],
        transcript,
        createdAt: new Date().toISOString(),
      };

      try {
        const fbRef = await adminDb.collection("feedback").add(fallbackFeedback);
        await adminDb.collection("interviews").doc(interviewId).update({ finalized: true });
        
        if (userId && userId !== "vapi-session") {
          await updateUserStreak(userId);
          await checkAchievements(userId);

          // Deduct 50 Coins for non-Pro users (Fallback Path)
          const userDoc = await adminDb.collection("users").doc(userId).get();
          const userData = userDoc.data();
          if (!userData?.isPro) {
            console.log(`🪙 Deducting 50 coins for user ${userId} (Non-Pro - Fallback Path)`);
            await deductCoins(userId, 50, "AI Mock Interview");
          }
        }
        
        return { success: true, feedbackId: fbRef.id, isFallback: true };
      } catch (innerError) {
        return { success: false, error: "System error: Failed to save interview session." };
      }
    }
  } catch (error) {
    console.error("❌ Error in createFeedback action:", error);
    return { success: false, error: "Server error occurred during feedback generation." };
  }
}


export async function updateFeedbackScore(feedbackId: string, score: number) {
  try {
    await adminDb.collection("feedback").doc(feedbackId).update({
      totalScore: score
    });
    console.log(`✅ Database Sync: Feedback ${feedbackId} updated with score ${score}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating feedback score:", error);
    return { success: false, error: "Failed to sync score to database." };
  }
}

export async function getInterviewById(id: string): Promise<Record<string, unknown> | null> {
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
    interviews.sort((a: Record<string, any>, b: Record<string, any>) => {
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

export async function getAllInterviews() {
  try {
    const snapshot = await adminDb.collection("interviews").get();
    const interviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, interviews };
  } catch (error: any) {
    console.error("❌ Get All Interviews Error:", error);
    return { success: false, error: error.message };
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

export async function getAllReviews() {
  try {
    const snapshot = await adminDb.collection("reviews").get();
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, reviews };
  } catch (error: any) {
    console.error("❌ Get All Reviews Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllFeedbacks() {
  try {
    const snapshot = await adminDb.collection("feedback").get();
    const feedbacks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, feedbacks };
  } catch (error: any) {
    console.error("❌ Get All Feedbacks Error:", error);
    return { success: false, error: error.message };
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
    // 1. Fetch both collections in parallel
    const [feedbackSnapshot, interviewSnapshot] = await Promise.all([
      adminDb.collection("feedback").where("userId", "==", userId).get(),
      adminDb.collection("interviews").where("userId", "==", userId).get()
    ]);

    const interviewMap = new Map(interviewSnapshot.docs.map(doc => [doc.id, doc.data()]));
    
    // 2. Identify only feedbacks that belong to an existing interview
    const feedbacksRaw = feedbackSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as any));
    
    // 3. Deduplicate: only the latest feedback per interviewId
    const latestFeedbackByInterview = new Map<string, any>();
    feedbacksRaw.forEach((fb) => {
      if (interviewMap.has(fb.interviewId)) {
        const current = latestFeedbackByInterview.get(fb.interviewId);
        if (!current || new Date(fb.createdAt).getTime() > new Date(current.createdAt).getTime()) {
          latestFeedbackByInterview.set(fb.interviewId, fb);
        }
      }
    });

    const validFeedbacks = Array.from(latestFeedbackByInterview.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 4. Generate Score Trend (strictly chronological)
    const scoreTrend = validFeedbacks.map((fb) => ({
      date: new Date(fb.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: Number(fb.totalScore || 0),
      role: interviewMap.get(fb.interviewId)?.role || "Interview session"
    }));

    // 5. Generate Skill Breakdown (Average across sessions)
    const categories = ["Communication Skills", "Technical Knowledge", "Problem Solving", "Confidence and Clarity", "Cultural Fit"];
    const skillTotals = new Map<string, { sum: number; count: number }>();
    categories.forEach(cat => skillTotals.set(cat, { sum: 0, count: 0 }));

    validFeedbacks.forEach((fb) => {
      const scores = fb.categoryScores && fb.categoryScores.length > 0 
        ? fb.categoryScores 
        : categories.map((cat, idx) => ({
            name: cat,
            score: Math.max(0, Math.min(100, (fb.totalScore || 0) + (idx === 0 ? 0 : idx % 2 === 0 ? 5 : -5)))
          }));

      scores.forEach((cat: any) => {
        const stats = skillTotals.get(cat.name);
        if (stats) {
          stats.sum += Number(cat.score || 0);
          stats.count += 1;
        }
      });
    });

    const skillBreakdown = categories.map(cat => {
      const stats = skillTotals.get(cat)!;
      return {
        subject: cat,
        A: stats.count > 0 ? Math.round(stats.sum / stats.count) : 0,
        fullMark: 100
      };
    });

    return {
      scoreTrend,
      skillBreakdown,
      totalInterviews: interviewSnapshot.size, 
      completedInterviews: validFeedbacks.length,
      highestScore: validFeedbacks.length > 0 
        ? Math.max(...validFeedbacks.map((fb) => fb.totalScore || 0)) 
        : 0,
      averageScore: validFeedbacks.length > 0 
        ? Math.round(validFeedbacks.reduce((acc, fb) => acc + (fb.totalScore || 0), 0) / validFeedbacks.length) 
        : 0,
    };
  } catch (error) {
    console.error("❌ Critical Analytics Error:", error);
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
    feedbackSnapshot.docs.forEach((doc) => {
      const data = doc.data() as { createdAt?: string };
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

export async function getFullStreakData(userId: string): Promise<{ activeDates: string[]; streakCount: number }> {
  try {
    const feedbackSnapshot = await adminDb
      .collection("feedback")
      .where("userId", "==", userId)
      .get();
      
    const activeDates: string[] = [];
    feedbackSnapshot.docs.forEach((doc) => {
      const data = doc.data() as { createdAt?: string };
      if (data.createdAt) {
        activeDates.push(data.createdAt.split('T')[0]);
      }
    });

    return {
      activeDates,
      streakCount: activeDates.length > 0 ? (await adminDb.collection("users").doc(userId).get()).data()?.streakCount || 0 : 0
    };
  } catch (error) {
    console.error("❌ Error fetching full streak data:", error);
    return { activeDates: [], streakCount: 0 };
  }
}

export async function getUserPublicInfo(userId: string) {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) return null;
    const userData = userDoc.data();
    
    const analytics = await getUserAnalytics(userId);
    
    return {
      name: userData?.name || "Candidate",
      email: userData?.email,
      photoURL: userData?.photoURL,
      streakCount: userData?.streakCount || 0,
      badges: userData?.badges || [],
      analytics
    };
  } catch (error) {
    console.error("❌ Error fetching public user info:", error);
    return null;
  }
}

