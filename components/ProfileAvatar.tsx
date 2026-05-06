"use client";
import React, { useState, useRef } from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { Pencil, Loader2 } from "lucide-react";
import { auth, storage } from "@/firebase/client";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateUserPhoto } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ImageCropper from "./ImageCropper";
import { AnimatePresence } from "framer-motion";

interface ProfileAvatarProps {
  userId: string;
  initialPhotoUrl?: string;
  userInitial: string;
}

const ProfileAvatar = ({ userId, initialPhotoUrl, userInitial }: ProfileAvatarProps) => {
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl || "/user-avatar.webp");
  const [uploading, setUploading] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large! Please upload an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Step 1: Close modal immediately - Zero wait
    setTempImage(null);
    
    // Create an Optimistic URL for instant feedback
    const optimisticUrl = URL.createObjectURL(croppedBlob);
    const previousPhotoUrl = photoUrl;
    
    // Step 2: Update UI instantly across the page
    setPhotoUrl(optimisticUrl);
    toast.success("Profile updated!");
    
    // Step 3: Run the heavy lifting in the background without blocking the user
    (async () => {
      try {
        setUploading(true);
        
        // Convert Blob to Base64 String for 100% FREE storage in Firestore
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(croppedBlob);
        });
        
        const base64String = await base64Promise;
        
        // Save directly to Firestore Database
        await updateUserPhoto(userId, base64String);
        
        // Update local state with the permanent base64 string
        setPhotoUrl(base64String); 
        
        router.refresh(); 
      } catch (error) {
        console.error("Background upload error:", error);
        setPhotoUrl(previousPhotoUrl); // Revert only on true error
      } finally {
        setUploading(false);
        URL.revokeObjectURL(optimisticUrl);
      }
    })();
  };

  return (
    <>
      <div className="relative group flex-shrink-0">
        {/* Ring Glow Effect */}
        <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 rounded-full opacity-30 group-hover:opacity-100 blur-sm transition-all duration-700 animate-pulse" />
        
        {/* Animated Border Ring */}
        <div className="absolute -inset-1 rounded-full border-2 border-dashed border-blue-500/30 group-hover:border-blue-500 group-hover:rotate-180 transition-all duration-1000 z-0" />

        {/* Avatar Container */}
        <div 
          className={cn(
            "relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-[var(--surface-base)] flex items-center justify-center border-4 border-[var(--surface-card)] shadow-2xl overflow-hidden z-10"
          )}
        >
          <NextImage 
            src={photoUrl || "/user-avatar.webp"} 
            alt="Profile Avatar" 
            fill 
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized={photoUrl?.startsWith('blob:')}
          />
          
        </div>

        {/* Floating Upload Button (Pencil Design) */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "absolute bottom-1 right-1 md:bottom-2 md:right-2 z-30 h-7 w-7 md:h-8 md:w-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl hover:bg-blue-700 hover:scale-110 transition-all active:scale-95 border-2 border-[var(--surface-card)] group/btn",
            uploading && "opacity-90 cursor-wait"
          )}
          title="Update Photo"
        >
          {uploading ? (
            <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Pencil className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover/btn:rotate-12 transition-transform" />
          )}
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileSelect}
        />
      </div>

      <AnimatePresence>
        {tempImage && (
          <ImageCropper
            image={tempImage}
            onCropComplete={handleCropComplete}
            onCancel={() => setTempImage(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileAvatar;
