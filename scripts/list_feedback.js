const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function listPublicFeedback() {
  const snapshot = await db.collection("feedback").where("isPublic", "==", true).limit(5).get();
  if (snapshot.empty) {
    console.log("No public feedback found.");
    return;
  }
  snapshot.forEach(doc => {
    console.log(`ID: ${doc.id}`);
  });
}

listPublicFeedback().catch(console.error);
