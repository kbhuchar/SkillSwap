"use client";

import { useRef, useState } from "react";
import { Plus, X, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 6;
export const MIN_PHOTOS = 3;

function resizeToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface PhotoGridProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function PhotoGrid({ photos, onChange }: PhotoGridProps) {
  const [uploading, setUploading] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeSlot = useRef<number>(0);

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] ?? null);

  const openPicker = (index: number) => {
    activeSlot.current = index;
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const idx = activeSlot.current;
    setUploading(idx);
    try {
      const base64 = await resizeToBase64(file);
      const next = [...photos];
      next[idx] = base64;
      onChange(next.filter(Boolean).slice(0, MAX_PHOTOS));
    } catch {
      alert("Failed to process image. Please try another.");
    } finally {
      setUploading(null);
    }
  };

  const removePhoto = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const next = [...photos];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div>
      {/* Hinge-style grid: slot 0 is large (col-span-2 row-span-2), slots 1-2 right, 3-5 bottom */}
      <div className="grid grid-cols-3 gap-2">
        {slots.map((photo, i) => {
          const isLarge = i === 0;
          const isUploading = uploading === i;

          return (
            <div
              key={i}
              onClick={() => !photo && openPicker(i)}
              className={cn(
                "relative rounded-xl overflow-hidden bg-[#181818] border border-dashed border-[#2a2a2a] transition-colors",
                !photo && "cursor-pointer hover:border-cyan-500/40 hover:bg-[#1e1e1e]",
                isLarge ? "col-span-2 row-span-2" : "aspect-square",
              )}
              style={isLarge ? { aspectRatio: "1 / 1" } : undefined}
            >
              {photo ? (
                <>
                  <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <Star className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" />
                      <span className="text-[10px] font-semibold text-white">Main</span>
                    </div>
                  )}
                  <div
                    onClick={() => openPicker(i)}
                    className="absolute inset-0 bg-black/0 hover:bg-black/25 transition-colors cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={(e) => removePhoto(e, i)}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80 transition-colors z-10"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  ) : (
                    <div className="w-7 h-7 rounded-full border border-[#3a3a3a] flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 text-[#555]" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] mt-2.5">
        {photos.length < MIN_PHOTOS ? (
          <span className="text-[#888]">
            Add at least <span className="text-cyan-400 font-semibold">{MIN_PHOTOS - photos.length}</span> more photo{MIN_PHOTOS - photos.length !== 1 ? "s" : ""}
          </span>
        ) : (
          <span className="text-emerald-400">{photos.length} photo{photos.length !== 1 ? "s" : ""} added ✓</span>
        )}
      </p>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
