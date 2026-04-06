
import { adminDb } from "./firebase/admin";

async function debugStreak() {
  const interviewId = "MqT6XBF87lec6YwYImW7";
  
  console.log("--- Debugging Interview ---");
  const interviewDoc = await adminDb.collection("interviews").doc(interviewId).get();
  if (!interviewDoc.exists) {
    console.log("Interview not found!");
    return;
  }
  const interviewData = interviewDoc.data();
  console.log("Interview Data:", JSON.stringify(interviewData, null, 2));
  
  const userId = interviewData?.userId;
  if (!userId) {
    console.log("No userId found for this interview.");
    return;
  }

  console.log("\n--- Debugging User ---");
  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    console.log("User not found!");
    return;
  }
  const userData = userDoc.data();
  console.log("User Data:", JSON.stringify(userData, null, 2));

  console.log("\n--- Checking Feedback ---");
  const feedbackSnapshot = await adminDb.collection("feedback")
    .where("interviewId", "==", interviewId)
    .get();
  
  if (feedbackSnapshot.empty) {
    console.log("No feedback found for this interview.");
  } else {
    feedbackSnapshot.docs.forEach(doc => {
      console.log("Feedback Data:", JSON.stringify(doc.data(), null, 2));
    });
  }
}

debugStreak().catch(console.error);
