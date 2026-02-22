"use client";

import { useCallback, useState } from "react";
import { UploadIcon } from "../icons";

/** Props for VideoUpload */
interface VideoUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const ACCEPTED_TYPES = "video/mp4,video/avi,video/quicktime,.mp4,.avi,.mov";

/** Drag-and-drop or click-to-upload video. Accepts MP4, AVI, MOV. */
export function VideoUpload({ file, onFileChange }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile?.type.startsWith("video/")) {
        onFileChange(droppedFile);
      }
    },
    [onFileChange]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile?.type.startsWith("video/")) {
        onFileChange(selectedFile);
      }
    },
    [onFileChange]
  );

  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 transition-all ${
        isDragging
          ? "border-amber-400 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
          : "border-slate-700/70 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/70"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="hidden"
      />
      <UploadIcon className="mb-3 h-12 w-12 text-amber-300" />
      <span className="text-center text-sm font-medium text-slate-100">
        {file ? file.name : "Drag & drop video here or click to upload"}
      </span>
      <span className="mt-1 text-xs text-slate-400">
        Supports: MP4, AVI, MOV
      </span>
    </label>
  );
}
