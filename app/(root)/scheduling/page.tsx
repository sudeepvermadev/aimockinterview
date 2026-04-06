import { Calendar } from "@/components/Calendar";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

export default async function SchedulingPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/sign-in");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] py-20 px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-4">
                        Mastery Tracker
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white">
                        Your Interview <span className="text-blue-600 dark:text-blue-500">Scheduler</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Consistency builds confidence. Set your schedule, track your progress, and get automated professional reminders to keep you on track.
                    </p>
                </div>

                <div className="relative z-10">
                    <Calendar />
                </div>
            </div>
        </div>
    );
}
