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

async function checkUserData() {
  console.log("🔍 Checking 3 random users for 'review' field...");
  
  const usersSnapshot = await db.collection("users").limit(3).get();
  
  usersSnapshot.forEach(doc => {
    console.log(`User ID: ${doc.id}`);
    console.log(`Data:`, JSON.stringify(doc.data(), null, 2));
    console.log("-------------------");
  });

  process.exit(0);
}

checkUserData().catch(err => {
  console.error("❌ Check failed:", err);
  process.exit(1);
});
