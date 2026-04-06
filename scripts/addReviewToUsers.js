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

async function migrateUsers() {
  console.log("🚀 Starting database migration: Adding 'review: 5' to all users...");
  
  const usersSnapshot = await db.collection("users").get();
  console.log(`Found ${usersSnapshot.size} total users.`);

  let updatedCount = 0;
  const batchSize = 100;
  let batch = db.batch();

  for (let i = 0; i < usersSnapshot.docs.length; i++) {
    const userDoc = usersSnapshot.docs[i];
    
    // Add 'review' field with value 5
    batch.update(userDoc.ref, { review: 5 });
    updatedCount++;

    // Commit in batches of 100 for safety and performance
    if (updatedCount % batchSize === 0 || i === usersSnapshot.docs.length - 1) {
      await batch.commit();
      console.log(`- Progress: ${updatedCount}/${usersSnapshot.size} users updated.`);
      batch = db.batch();
    }
  }

  console.log(`✅ Migration complete. Successfully updated ${updatedCount} users with review: 5.`);
  process.exit(0);
}

migrateUsers().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
