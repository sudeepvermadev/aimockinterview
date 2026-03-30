import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  // Ultra-robust cleanup: handle literal \n, actual newlines, and surrounding quotes
  privateKey = privateKey
    .replace(/\\n/g, '\n') // Turn literal \n into real newlines
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .split(/\n/) // Split by newline
    .map(line => line.trim()) // Trim each line
    .filter(line => line.length > 0) // Remove empty lines
    .join('\n'); // Rejoin with proper newlines
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey || "",
};

let adminApp: App;

if (!getApps().length) {
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error("Missing Firebase Admin variables in .env file. Check FIREBASE_PROJECT_ID, CLIENT_EMAIL, and PRIVATE_KEY.");
  }

  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);