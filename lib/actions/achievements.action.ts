"use server";

import { adminDb } from "@/firebase/admin";

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
    if (streak >= 7 && !newBadges.includes("consistency-king")) {
      newBadges.push("consistency-king");
    }

    if (newBadges.length > currentBadges.length) {
      await userRef.update({ badges: newBadges });
      console.log(`🏆 New badges awarded to ${userId}:`, newBadges.filter(b => !currentBadges.includes(b)));
    }
  } catch (error) {
    console.error("❌ Error checking achievements:", error);
  }
}
