"use client";
import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

const ImageCropper = ({ image, onCropComplete, onCancel }: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("No 2d context");

    // GMAIL-LIKE SPEED OPTIMIZATION:
    // We force the final image to be exactly 256x256px.
    // This makes the file tiny (kb instead of mb) and nearly instant to upload.
    const TARGET_SIZE = 256;
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      TARGET_SIZE,
      TARGET_SIZE
    );

    return new Promise((resolve) => {
      // Further reduce quality to 0.6 for extreme speed without losing visual clarity for avatars
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/jpeg", 0.6);
    });
  };

  const handleConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error(e);
    }
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-xl bg-[var(--surface-card)] rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Optimize & Crop</h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Sizing your photo for lightning-fast uploads</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-[var(--surface-base)] rounded-xl transition-colors">
            <X className="w-6 h-6 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-80 md:h-96 bg-[#0a0a0f]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
            cropShape="round"
            showGrid={false}
          />
        </div>

        {/* Footer & Controls */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-blue-600 h-1.5 bg-[var(--surface-base)] rounded-full appearance-none cursor-pointer"
            />
            <ZoomIn className="w-5 h-5 text-[var(--text-muted)]" />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold hover:bg-[var(--surface-base)] transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" /> Instant Save
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
};

export default ImageCropper;
