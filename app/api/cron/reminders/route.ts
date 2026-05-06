import { adminDb } from "@/firebase/admin";
import { sendTimedReminderEmail, sendMissedInterviewEmail } from "@/lib/email";
import { createNotification } from "@/lib/actions/notifications.action";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Optional: Check for a secret key to prevent unauthorized calls
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const now = new Date();
    const nowMs = now.getTime();

    // Query pending schedules
    const schedulesSnapshot = await adminDb
      .collection("schedules")
      .where("status", "==", "pending")
      .get();

    console.log(`[Cron] Checking ${schedulesSnapshot.size} pending schedules...`);

    const results: string[] = [];

    for (const doc of schedulesSnapshot.docs) {
      const data = doc.data();
      const id = doc.id;
      const scheduledAt = data.scheduledAt;
      const userEmail = data.userEmail;
      const userName = data.userName;
      const remindersSent = data.remindersSent || {};

      if (!scheduledAt || !userEmail) continue;

      const scheduleTime = new Date(scheduledAt).getTime();
      const diffMs = scheduleTime - nowMs;
      const diffMins = diffMs / (1000 * 60);

      // Check for missed status (if 1 minute past scheduled time)
      // This is the "defusing" of the time conflict you mentioned
      if (diffMins < -1 && data.status === "pending") {
          console.log(`[Cron] Marking ${id} as missed (Time: ${scheduledAt})`);
          await adminDb.collection("schedules").doc(id).update({ status: "missed" });
          
          // Send Missed Email
          if (userEmail) {
            await sendMissedInterviewEmail(userEmail, userName || "User", data.date, data.time)
                .catch(e => console.error("Missed email failed:", e));
          }

          await createNotification({
            userId: data.userId,
            type: "missed_interview",
            title: "Interview Missed ⚠️",
            message: `You missed your scheduled mock interview on ${data.date} at ${data.time}. Don't worry, you can always reschedule for another time!`,
            metadata: { date: data.date, time: data.time },
          }).catch(e => console.error("Notification failed:", e));

          results.push(`Marked ${id} as missed`);
          continue;
      }

      const diffHours = diffMins / 60;

      let reminderToSent: '1d' | '2h' | '15m' | '5m' | '1m' | null = null;

      // Intervals: 1 day, 2 hours, 15 mins, 5 mins, 1 min
      // Intervals: 1 day, 2 hours, 5 mins, 1 min
      // Priority given to most urgent reminders that haven't been sent
      if (diffMins <= 2 && diffMins > -2 && !remindersSent['1m']) {
          reminderToSent = '1m';
      } else if (diffMins <= 6 && diffMins > 2 && !remindersSent['5m']) {
          reminderToSent = '5m';
      } else if (diffHours <= 2.5 && diffHours > 0.5 && !remindersSent['2h']) {
          reminderToSent = '2h';
      } else if (diffHours <= 26 && diffHours > 12 && !remindersSent['1d']) {
          reminderToSent = '1d';
      }

      if (reminderToSent) {
        console.log(`[Cron] Target: ${scheduledAt} (UTC) | Current: ${now.toISOString()} | Diff: ${diffMins.toFixed(1)}m`);
        console.log(`[Cron] Sending ${reminderToSent} reminder to ${userEmail} for schedule ${id}`);
        await sendTimedReminderEmail(userEmail, userName, data.date, data.time, reminderToSent);
        
        // Update remindersSent in DB
        await adminDb.collection("schedules").doc(id).update({
          [`remindersSent.${reminderToSent}`]: true
        });
        
        results.push(`Sent ${reminderToSent} to ${userEmail}`);
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error("[Cron Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
