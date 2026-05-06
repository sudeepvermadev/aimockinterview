"use server";

import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import { sendInterviewReminderEmail, sendMissedInterviewEmail } from "@/lib/email";
import { createNotification } from "./notifications.action";
import { revalidatePath } from "next/cache";

export async function addSchedule(date: string, time?: string, clientScheduledAt?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Convert date and time to a single timestamp for better comparison and querying
    let scheduledAt = clientScheduledAt;
    
    if (!scheduledAt) {
        // Fallback for older clients or manual calls
        if (time) {
      const [timePart, period] = time.split(" ");
      let [hours, minutes] = timePart.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      
      const d = new Date(date);
      d.setHours(hours, minutes, 0, 0);
      scheduledAt = d.toISOString();
    } else {
      const d = new Date(date);
      d.setHours(10, 0, 0, 0); // Default to 10 AM if no time provided
      scheduledAt = d.toISOString();
    }
    }

    console.log(`[Schedule] Creating schedule for ${user.email} at ${scheduledAt} (UTC)`);

    const startTime = new Date(scheduledAt).getTime();
    const buffer = 15 * 60 * 1000; // 15 minutes buffer

    // Check for conflicts on the same day for this user (only pending schedules)
    const schedulesSnapshot = await adminDb
      .collection("schedules")
      .where("userId", "==", user.id)
      .where("status", "==", "pending") // Only check for conflicts with pending interviews
      .get();

    const existingSchedules = schedulesSnapshot.docs.map(doc => doc.data());
    const conflict = existingSchedules.find(s => {
      if (!s.scheduledAt) return false;
      const sTime = new Date(s.scheduledAt).getTime();
      return Math.abs(sTime - startTime) < buffer;
    });

    if (conflict) {
      const conflictMsg = conflict.time ? `near ${conflict.time}` : `on this date`;
      throw new Error(`Time conflict! You already have an interview scheduled ${conflictMsg}. Please choose a time at least 15 minutes apart.`);
    }

    const scheduleRef = adminDb.collection("schedules").doc(); // Use auto-generated ID

    // Check if interview already exists for this user on this date to set initial status
    const interviewsSnapshot = await adminDb
      .collection("interviews")
      .where("userId", "==", user.id)
      .get();

    let status = "pending";
    const hasCompleted = interviewsSnapshot.docs.some(doc => {
      const interviewDate = doc.data().createdAt;
      if (!interviewDate) return false;
      return interviewDate.split("T")[0] === date;
    });

    if (hasCompleted) status = "done";

    await scheduleRef.set({
      id: scheduleRef.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      date,
      time: time || null,
      scheduledAt,
      remindersSent: {
        "1d": false,
        "2h": false,
        "5m": false,
        "1m": false
      },
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
      message: `Your mock interview has been scheduled for ${new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}${timeText}. Start practicing at https://luca-subhyoidean-governmentally.ngrok-free.dev/interview`,
      metadata: { date, time, scheduledAt },
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

    const nowMs = new Date().getTime();
    const missedBuffer = 1 * 60 * 1000; // 1 minute grace period (reduced from 15m)

    const updatedSchedules = await Promise.all(schedules.map(async (s: any) => {
        // First priority: mark as done if interview was completed on that date
        if (s.status === "pending" && completedDates.has(s.date)) {
            await adminDb.collection("schedules").doc(s.id).update({ status: "done" });
            return { ...s, status: "done" };
        }
        
        // Second priority: mark as missed if time expired (scheduledAt + 1 min buffer)
        if (s.status === "pending" && s.scheduledAt) {
            const scheduleTimeMs = new Date(s.scheduledAt).getTime();
            if (nowMs > scheduleTimeMs + missedBuffer) {
                console.log(`[Schedule] Marking ${s.id} as missed (App View)`);
                await adminDb.collection("schedules").doc(s.id).update({ status: "missed" });
                
                // Send Missed Email
                if (s.userEmail) {
                    sendMissedInterviewEmail(s.userEmail, s.userName || "User", s.date, s.time)
                        .catch(e => console.error("Missed email failed:", e));
                }

                // Create missed notification
                createNotification({
                    userId: user.id,
                    type: "missed_interview",
                    title: "Interview Missed ⚠️",
                    message: `You missed your scheduled mock interview on ${s.date} at ${s.time}. Don't worry, you can always reschedule for another time!`,
                    metadata: { date: s.date, time: s.time },
                }).catch(e => console.error("Notification create failed:", e));

                return { ...s, status: "missed" };
            }
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
        message: `A reminder email has been sent to ${user.email}. Access your session here: https://luca-subhyoidean-governmentally.ngrok-free.dev/interview`,
        metadata: { date, time },
      });

      return { success: true };
    } catch (error: any) {
      console.error("Reminder Error:", error);
      return { success: false, message: error.message };
    }
}
