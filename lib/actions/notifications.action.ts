"use server";

import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";

export type NotificationType = 
  | "welcome"
  | "schedule_confirmed"
  | "reminder_sent"
  | "interview_completed"
  | "missed_interview"
  | "streak_milestone"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}) {
  try {
    const docRef = await adminDb.collection("notifications").add({
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      metadata: metadata || {},
    });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("❌ Create Notification Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getNotifications() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const snapshot = await adminDb
      .collection("notifications")
      .where("userId", "==", user.id)
      .get();

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];

    // Sort client-side to avoid requiring a Firestore composite index
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return notifications.slice(0, 50);
  } catch (error) {
    console.error("❌ Get Notifications Error:", error);
    return [];
  }
}

export async function getUnreadNotificationCount() {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const snapshot = await adminDb
      .collection("notifications")
      .where("userId", "==", user.id)
      .where("read", "==", false)
      .get();

    return snapshot.size;
  } catch (error) {
    console.error("❌ Count Notifications Error:", error);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await adminDb.collection("notifications").doc(notificationId).update({
      read: true,
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ Mark Read Error:", error);
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const snapshot = await adminDb
      .collection("notifications")
      .where("userId", "==", user.id)
      .where("read", "==", false)
      .get();

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();

    return { success: true, count: snapshot.size };
  } catch (error: any) {
    console.error("❌ Mark All Read Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await adminDb.collection("notifications").doc(notificationId).delete();
    return { success: true };
  } catch (error: any) {
    console.error("❌ Delete Notification Error:", error);
    return { success: false, error: error.message };
  }
}
