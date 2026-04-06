
import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const userDoc = await adminDb.collection("users").doc(user.id).get();
  const userData = userDoc.data();

  const feedbackSnapshot = await adminDb.collection("feedback")
    .where("userId", "==", user.id)
    .orderBy("createdAt", "desc")
    .get();

  const feedbacks = feedbackSnapshot.docs.map(doc => ({
    id: doc.id,
    createdAt: doc.data().createdAt,
    interviewId: doc.data().interviewId
  }));

  return NextResponse.json({
    user: {
      id: user.id,
      streakCount: userData?.streakCount,
      lastActiveDate: userData?.lastActiveDate
    },
    feedbacks
  });
}
