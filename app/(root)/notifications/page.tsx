import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import NotificationsClient from "./NotificationsClient";
import { getNotifications, getUnreadNotificationCount } from "@/lib/actions/notifications.action";

export default async function NotificationsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/sign-in");

    const notifications = await getNotifications();
    const unreadCount = await getUnreadNotificationCount();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] py-20 px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

            <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-[0.2em] mb-4">
                        Notification Center
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white">
                        Your <span className="text-orange-600 dark:text-orange-500">Notifications</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Stay updated with your scheduled interviews, reminders, and important alerts.
                    </p>
                </div>

                <div className="relative z-10">
                    <NotificationsClient 
                        initialNotifications={JSON.parse(JSON.stringify(notifications))} 
                        initialUnreadCount={unreadCount} 
                    />
                </div>
            </div>
        </div>
    );
}
