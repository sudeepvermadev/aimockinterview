"use server";

import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import { sendInterviewReminderEmail } from "@/lib/email";
import { createNotification } from "./notifications.action";
import { revalidatePath } from "next/cache";

export async function addSchedule(date: string, time?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const scheduleId = `${user.id}_${date}`;
    const scheduleRef = adminDb.collection("schedules").doc(scheduleId);

    // Check if interview already exists for this user on this date to set initial status
    const interviewsSnapshot = await adminDb
      .collection("interviews")
      .where("userId", "==", user.id)
      .get();

    let status = "pending";
    const hasCompleted = interviewsSnapshot.docs.some(doc => {
      const interviewDate = doc.data().createdAt; // Assuming createdAt is the date
      if (!interviewDate) return false;
      return interviewDate.split("T")[0] === date;
    });

    if (hasCompleted) status = "done";

    await scheduleRef.set({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      date,
      time: time || null,
      status,
      createdAt: new Date().toISOString(),
    });

    // Send confirmation email
    if (user.email) {
        await sendInterviewReminderEmail(user.email, user.name, date, time);
    }

    // Create notification
    const timeText = time ? ` at ${time}` : '';
    await createNotification({
      userId: user.id,
      type: "schedule_confirmed",
      title: "Interview Scheduled",
      message: `Your mock interview has been scheduled for ${new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}${timeText}. A confirmation email has been sent.`,
      metadata: { date, time },
    });

    revalidatePath("/scheduling");
    return { success: true };
  } catch (error: any) {
    console.error("Firestore Error:", error);
    return { success: false, message: error.message };
  }
}

export async function getSchedules() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const schedulesSnapshot = await adminDb
      .collection("schedules")
      .where("userId", "==", user.id)
      .get();

    const schedules = schedulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Auto-update status if interview was completed
    const interviewsSnapshot = await adminDb
      .collection("interviews")
      .where("userId", "==", user.id)
      .get();

    const completedDates = new Set(
        interviewsSnapshot.docs.map(doc => {
            const date = doc.data().createdAt;
            return date ? date.split("T")[0] : null;
        }).filter(Boolean)
    );

    const updatedSchedules = await Promise.all(schedules.map(async (s: any) => {
        if (s.status === "pending" && completedDates.has(s.date)) {
            await adminDb.collection("schedules").doc(s.id).update({ status: "done" });
            return { ...s, status: "done" };
        }
        return s;
    }));

    return updatedSchedules;
  } catch (error) {
    console.error("Firestore Error:", error);
    return [];
  }
}

export async function deleteSchedule(scheduleId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await adminDb.collection("schedules").doc(scheduleId).delete();
    revalidatePath("/scheduling");
    return { success: true };
  } catch (error: any) {
    console.error("Firestore Error:", error);
    return { success: false, message: error.message };
  }
}

export async function sendManualReminder(date: string, time?: string) {
    try {
      const user = await getCurrentUser();
      if (!user || !user.email) throw new Error("Unauthorized or email missing");
  
      await sendInterviewReminderEmail(user.email, user.name, date, time);

      // Create notification
      const timeText = time ? ` at ${time}` : '';
      await createNotification({
        userId: user.id,
        type: "reminder_sent",
        title: "Reminder Sent 🔔",
        message: `A reminder email for your interview on ${new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}${timeText} has been sent to ${user.email}.`,
        metadata: { date, time },
      });

      return { success: true };
    } catch (error: any) {
      console.error("Reminder Error:", error);
      return { success: false, message: error.message };
    }
}
