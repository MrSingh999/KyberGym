import React, { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";

interface AvatarUploadProps {
  currentPhotoUrl?: string;
  name: string;
  onChange: (file: File | null) => void;
}

export function AvatarUpload({ currentPhotoUrl, name, onChange }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      onChange(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-surface border-2 border-border-default flex items-center justify-center text-2xl font-bold text-text-primary shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-border-hover">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials || "?"
          )}
        </div>
        
        <label className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-white">
          <Camera className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-semibold uppercase tracking-wider">Change</span>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div className="flex flex-col items-center sm:items-start gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm font-semibold text-text-primary bg-surface border border-border-default hover:border-border-hover hover:bg-surface-hover px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload Photo
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm font-medium text-error hover:bg-error/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            Remove Photo
          </button>
        )}
        <p className="text-[11px] text-text-muted text-center sm:text-left">
          JPG, GIF or PNG. Max 5MB.
        </p>
      </div>
    </div>
  );
}
