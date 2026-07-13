import React, { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex items-center space-x-6">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-hover border border-default flex items-center justify-center text-2xl font-bold text-primary shadow-sm">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials || "?"
          )}
        </div>
        
        <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
          <Camera className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Change</span>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div className="flex flex-col space-y-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm font-medium text-primary bg-surface border border-default hover:border-hover px-4 py-2 rounded-lg transition-colors flex items-center shadow-sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload New Photo
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm font-medium text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Remove Photo
          </button>
        )}
        <p className="text-xs text-muted max-w-[200px]">
          JPG, GIF or PNG. Max size of 5MB.
        </p>
      </div>
    </div>
  );
}
