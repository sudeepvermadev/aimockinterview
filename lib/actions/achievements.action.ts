"use server";

import { adminDb } from "@/firebase/admin";
import { awardRewardBundle } from "./payment.action";

export async function checkAchievements(userId: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) return;

    const userData = userSnapshot.data();
    const currentBadges = userData?.badges || [];
    const newBadges = [...currentBadges];

    // Fetch user's interviews for stats
    const interviewsSnapshot = await adminDb.collection("interviews").where("userId", "==", userId).get();
    const feedbacksSnapshot = await adminDb.collection("feedback").where("userId", "==", userId).get();
    
    const interviewCount = interviewsSnapshot.size;
    const feedbacks = feedbacksSnapshot.docs.map(d => d.data());
    const roles = new Set(interviewsSnapshot.docs.map(d => d.data().role));

    // 1. Fire Starter (1+ interviews)
    if (interviewCount >= 1 && !newBadges.includes("fire-starter")) {
      newBadges.push("fire-starter");
    }

    // 2. Perfectionist (95+ score)
    const hasPerfectScore = feedbacks.some(f => f.totalScore >= 95);
    if (hasPerfectScore && !newBadges.includes("perfectionist")) {
      newBadges.push("perfectionist");
    }

    // 3. Polymath (3+ different roles)
    if (roles.size >= 3 && !newBadges.includes("polymath")) {
      newBadges.push("polymath");
    }

    // 4. Veteran (10+ total interviews)
    if (interviewCount >= 10 && !newBadges.includes("veteran")) {
      newBadges.push("veteran");
    }

    // 5. Consistency King (7+ day streak)
    const streak = userData?.streakCount || 0;
    if (streak >= 7 && !newBadges.includes("streak-7")) {
      newBadges.push("streak-7");
      await awardRewardBundle(userId, 10, "7-Day Streak");
    }

    // 6. 14-Day Streak
    if (streak >= 14 && !newBadges.includes("streak-14")) {
      newBadges.push("streak-14");
      await awardRewardBundle(userId, 20, "14-Day Streak");
    }

    // 7. 50-Day Streak
    if (streak >= 50 && !newBadges.includes("streak-50")) {
      newBadges.push("streak-50");
      await awardRewardBundle(userId, 30, "50-Day Streak");
    }

    // 8. 100-Day Streak
    if (streak >= 100 && !newBadges.includes("streak-100")) {
      newBadges.push("streak-100");
      await awardRewardBundle(userId, 50, "100-Day Streak");
    }

    // 9. 200-Day Streak
    if (streak >= 200 && !newBadges.includes("streak-200")) {
      newBadges.push("streak-200");
      await awardRewardBundle(userId, 50, "200-Day Streak");
    }

    // 10. 1-Year Streak
    if (streak >= 365 && !newBadges.includes("streak-365")) {
      newBadges.push("streak-365");
      await awardRewardBundle(userId, 100, "1-Year Streak");
    }

    if (newBadges.length > currentBadges.length) {
      await userRef.update({ badges: newBadges });
      console.log(`🏆 New rewards awarded to ${userId}:`, newBadges.filter(b => !currentBadges.includes(b)));
    }
  } catch (error) {
    console.error("❌ Error checking achievements:", error);
  }
}

export async function generateResumeAchievements() {
  try {
    // Simulated achievement synthesis
    return {
      success: true,
      achievements: [
        {
          skill: "Communication",
          impact: "High",
          bullet: "Articulated complex technical concepts with 95% clarity rating across multiple mock interview sessions."
        },
        {
          skill: "Problem Solving",
          impact: "Significant",
          bullet: "Demonstrated structured analytical thinking by resolving 10+ challenging algorithm-based interview questions."
        }
      ]
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}
