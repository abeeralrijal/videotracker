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
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 transition-colors ${
        isDragging
          ? "border-zinc-500 bg-zinc-100"
          : "border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50"
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
      <UploadIcon className="mb-3 h-12 w-12 text-zinc-400" />
      <span className="text-center text-sm font-medium text-zinc-700">
        {file ? file.name : "Drag & drop video here or click to upload"}
      </span>
      <span className="mt-1 text-xs text-zinc-500">
        Supports: MP4, AVI, MOV
      </span>
    </label>
  );
}
