"use client";

import NextImage from "next/image";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  userId: string;
  initialPhotoUrl?: string;
  userInitial: string;
}

const ProfileAvatar = ({ userId, initialPhotoUrl, userInitial }: ProfileAvatarProps) => {
  return (
    <div className="relative group flex-shrink-0">
      {/* Glow Effect */}
      <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
      
      {/* Avatar Container */}
      <div 
        className={cn(
          "relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-5xl border-4 border-[#0e0f15] shadow-2xl overflow-hidden"
        )}
      >
        {initialPhotoUrl ? (
          <NextImage 
            src={initialPhotoUrl} 
            alt="Profile Avatar" 
            fill 
            className="object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <span className="relative z-10">{userInitial}</span>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;
