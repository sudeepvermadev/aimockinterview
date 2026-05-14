import React from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFullStreakData } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import StreakDetail from "../../../components/StreakDetail";

const StreakPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
    return null;
  }

  // Ensure user properties are available for TypeScript narrowing
  const userData = user;
  const streakData = await getFullStreakData(userData.id);

  return (
    <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
      <StreakDetail 
        streakCount={streakData.streakCount} 
        activeDates={streakData.activeDates} 
        userName={userData.name}
      />
    </div>
  );
};

export default StreakPage;
