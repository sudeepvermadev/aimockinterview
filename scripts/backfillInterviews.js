const admin = require("firebase-admin");
require("dotenv").config({ path: ".env.local" });

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/^["']|["']$/g, '');
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey || "",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function backfill() {
  console.log("🚀 Starting backfill for existing interviews...");
  
  const interviewsSnapshot = await db.collection("interviews").get();
  console.log(`Found ${interviewsSnapshot.size} interviews.`);

  let updatedCount = 0;

  for (const doc of interviewsSnapshot.docs) {
    const interviewData = doc.data();
    const interviewId = doc.id;

    // 1. Check if feedback exists
    const feedbackQuery = await db.collection("feedback")
      .where("interviewId", "==", interviewId)
      .limit(1)
      .get();

    // 2. If no feedback, create a default one
    if (feedbackQuery.empty) {
      console.log(`- Creating default feedback for: ${interviewId}`);
      await db.collection("feedback").add({
        interviewId,
        userId: interviewData.userId || "vapi-session",
        totalScore: 0,
        categoryScores: [],
        strengths: ["Historical Session"],
        areasForImprovement: ["Retake to get live AI analysis"],
        finalAssessment: "This is a historical interview record. Retake the interview to get a detailed AI evaluation.",
        comparisons: [],
        transcript: [],
        createdAt: interviewData.createdAt || new Date().toISOString(),
      });
    }

    // 3. Mark as finalized
    if (!interviewData.finalized) {
      console.log(`- Finalizing interview: ${interviewId}`);
      await db.collection("interviews").doc(interviewId).update({ finalized: true });
    }

    updatedCount++;
  }

  console.log(`✅ Backfill complete. Updated ${updatedCount} interviews.`);
  process.exit(0);
}

backfill().catch(err => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
