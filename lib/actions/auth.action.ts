"use server";

import { adminAuth, adminDb } from "@/firebase/admin";
import { cookies } from "next/headers";
import { sendWelcomeEmail, sendGoodbyeEmail } from "@/lib/email";
import { createNotification } from "./notifications.action";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 1 week

export async function signUp(params: { uid: string; name: string; email: string }) {
  try {
    await adminDb.collection("users").doc(params.uid).set({
      name: params.name,
      email: params.email,
      createdAt: new Date().toISOString(),
      streakCount: 0,
      lastActiveDate: null,
      badges: [],
    });

    // Send Welcome Email (Fire and Forget)
    sendWelcomeEmail(params.email, params.name).catch(e => console.error("Email send failed:", e));

    // Create welcome notification
    createNotification({
      userId: params.uid,
      type: "welcome",
      title: "Welcome to PrepEdge! 🎉",
      message: `Hi ${params.name}, welcome aboard! Visit https://luca-subhyoidean-governmentally.ngrok-free.dev to start your AI-powered mock interview journey and build confidence.`,
    }).catch(e => console.error("Notification create failed:", e));

    return { success: true, message: "Account created successfully!" };
  } catch (error: any) {
    console.error("Firestore Error:", error);
    return { success: false, message: error.message };
  }
}

export async function signIn(params: { email: string; idToken: string }) {
  try {
    const sessionCookie = await adminAuth.createSessionCookie(params.idToken, {
      expiresIn: SESSION_DURATION * 1000,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: SESSION_DURATION,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // Send Login Notification/Welcome Email (For Testing)
    try {
      const userSnapshot = await adminDb.collection("users").where("email", "==", params.email).limit(1).get();
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        sendWelcomeEmail(params.email, userData.name || "User").catch(e => console.error("Login email failed:", e));
      }
    } catch (e) {
       console.error("User fetch failed for email:", e);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: "Invalid credentials." };
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    const userRecord = await adminDb.collection("users").doc(decodedClaims.uid).get();

    if (!userRecord.exists) {
      // Lazy-create user document for first-time Google sign-ins
      const authUser = await adminAuth.getUser(decodedClaims.uid);
      const guestName = authUser.displayName || "Unknown User";
      
      await adminDb.collection("users").doc(decodedClaims.uid).set({
        name: guestName,
        email: authUser.email,
        createdAt: new Date().toISOString(),
        streakCount: 0,
        lastActiveDate: null,
        badges: [],
      });

      // Send Welcome Email for First-Time Social Login
      if (authUser.email) {
        sendWelcomeEmail(authUser.email, guestName).catch(e => console.error("Email send failed:", e));
        
        // Also create welcome notification
        createNotification({
          userId: decodedClaims.uid,
          type: "welcome",
          title: "Welcome to PrepEdge! 🎉",
          message: `Hi ${guestName}, welcome aboard! Visit https://luca-subhyoidean-governmentally.ngrok-free.dev to start your AI-powered mock interview journey and build confidence.`,
        }).catch(e => console.error("Notification create failed:", e));
      }

      return {
        id: decodedClaims.uid,
        name: authUser.displayName || "Unknown User",
        email: authUser.email,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      ...userRecord.data(),
      id: userRecord.id,
    };
  } catch (error) {
    console.error("Session Verification Error:", error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function updateUserStreak(userId: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    const lastActiveDate = userData?.lastActiveDate; // Format: YYYY-MM-DD
    const currentStreak = userData?.streakCount || 0;

    const todayDate = new Date();
    // Use user-local time would be better, but server is "real world" standard here
    const today = todayDate.toISOString().split("T")[0];

    if (lastActiveDate === today) {
      // Already active today, don't increment
      return;
    }

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    let newStreak = 1;

    if (lastActiveDate === yesterday) {
      newStreak = currentStreak + 1;
    }

    await userRef.update({
      streakCount: newStreak,
      lastActiveDate: today,
    });

    console.log(`🔥 Streak updated for ${userId}: ${newStreak}`);
  } catch (error) {
    console.error("❌ Error updating user streak:", error);
  }
}

export async function updateUserPhoto(userId: string, photoUrl: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({ photoURL: photoUrl });
    console.log(`📸 Photo URL updated for ${userId}: ${photoUrl}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating user photo:", error);
    return { success: false, error: "Failed to update profile photo." };
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    const userSnapshot = await adminDb.collection("users").doc(userId).get();
    const userData = userSnapshot.data();

    // Send Goodbye Email before deletion
    if (userData?.email) {
      sendGoodbyeEmail(userData.email, userData.name || "User").catch(e => console.error("Goodbye email failed:", e));
    }

    const batch = adminDb.batch();

    // 1. Delete user document
    const userRef = adminDb.collection("users").doc(userId);
    batch.delete(userRef);

    // 2. Delete all interviews
    const interviewsSnapshot = await adminDb
      .collection("interviews")
      .where("userId", "==", userId)
      .get();
    interviewsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // 3. Delete all feedback
    const feedbackSnapshot = await adminDb
      .collection("feedback")
      .where("userId", "==", userId)
      .get();
    feedbackSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // 4. Delete all reviews
    const reviewsSnapshot = await adminDb
      .collection("reviews")
      .where("userId", "==", userId)
      .get();
    reviewsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // Commit Firestore deletions
    await batch.commit();

    // 5. Delete Firebase Auth record
    await adminAuth.deleteUser(userId);

    // 6. Clear session cookie
    await signOut();

    console.log(`🗑️ Account deleted for ${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Error deleting account:", error);
    return { success: false, message: error.message || "Failed to delete account." };
  }
}

export async function updateUserPlan(userId: string, plan: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({ 
      isPro: plan === "Pro",
      plan: plan,
      planUpdatedAt: new Date().toISOString()
    });
    console.log(`💳 User ${userId} upgraded to ${plan}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating user plan:", error);
    return { success: false, error: "Failed to update subscription plan." };
  }
}