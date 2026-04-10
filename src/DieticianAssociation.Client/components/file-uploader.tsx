"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useMediaStore } from "@/store/useMediaStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface FileUploaderProps {
  folder?: string;
  label?: string;
  multiple?: boolean;
  onUploadComplete?: (urls: string[]) => void;
  existingFiles?: string[];
}

export default function FileUploader({
  folder,
  multiple = true,
  onUploadComplete,
  label,
  existingFiles = [],
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploadFinished, setUploadFinished] = useState(false);
  const { uploadMedia, deleteFile, uploading, currentFileInfo } =
    useMediaStore();

  // Reset visual states when not uploading
  useEffect(() => {
    if (!uploading && progress === 100) {
      setUploadFinished(true);
      const timeout = setTimeout(() => {
        setUploadFinished(false);
        setProgress(0);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [uploading, progress]);

  useEffect(() => {
    if (existingFiles && existingFiles.length > 0) {
      setPreviews(existingFiles);
    }
  }, [existingFiles]);

  // --- Handle file selection ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles(multiple ? selected : [selected[0]]);
    setPreviews(
      multiple
        ? selected.map((f) => URL.createObjectURL(f))
        : [URL.createObjectURL(selected[0])],
    );
  };

  // --- Upload logic ---
  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ title: "No file selected", variant: "error" });
      return;
    }

    try {
      setProgress(0);
      setUploadFinished(false);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Animate progress from 0 → 100 in ~1 second
        setProgress(0);
        const duration = 1000;
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        let step = 0;
        const interval = setInterval(() => {
          step++;
          const percentage = Math.min(
            Math.round((step / totalSteps) * 100),
            100,
          );
          setProgress(percentage);
          if (percentage === 100) clearInterval(interval);
        }, stepTime);

        await uploadMedia(file, folder).then(() => {
          uploadedUrls.push(currentFileInfo?.url || "");
        });
      }

      onUploadComplete?.(uploadedUrls);
      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully.`,
      });

      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      toast({ title: "Upload Failed", variant: "error" });
    }
  };

  // --- Delete a file ---
  const handleDeleteFile = async (fileName: string, index: number) => {
    try {
      await deleteFile(fileName);
      toast({ title: "Deleted", description: `${fileName} removed.` });
      const updatedFiles = files.filter((_, i) => i !== index);
      const updatedPreviews = previews.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      setPreviews(updatedPreviews);
    } catch (err) {
      console.error(err);
      toast({ title: "Delete Failed", variant: "error" });
    }
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium block">
          {label || (multiple ? "Upload Files" : "Upload File")}
        </label>

        <div className="flex items-center gap-3">
          <Input
            type="file"
            multiple={multiple}
            accept="image/*,video/*,.pdf,.docx"
            onChange={handleFileChange}
            className={cn("cursor-pointer flex-1")}
          />

          {/* Upload button with progress and green success fill */}
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className={cn(
              "relative overflow-hidden shrink-0 w-36 transition-all duration-500",
              uploadFinished && "bg-green-600 hover:bg-green-700",
            )}
          >
            {/* Progress bar inside button */}
            {(uploading || progress > 0) && (
              <div
                className={cn(
                  "absolute left-0 top-0 h-full transition-all ease-linear duration-1000",
                  uploadFinished ? "bg-green-500" : "bg-blue-500/40",
                )}
                style={{ width: `${progress}%` }}
              ></div>
            )}

            <span className="relative z-10 text-sm font-medium">
              {uploading
                ? progress < 100
                  ? `Uploading... ${progress}%`
                  : "Finalizing..."
                : uploadFinished
                  ? "Done!"
                  : "Upload"}
            </span>
          </Button>
        </div>
      </div>

      {/* File previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {files.map((file, i) => {
            const ext = file.name.split(".").pop()?.toLowerCase() || "";
            let icon = "📄";
            if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
              icon = "🖼️";
            else if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext))
              icon = "🎥";
            else if (["pdf"].includes(ext)) icon = "📕";
            else if (["doc", "docx"].includes(ext)) icon = "📘";
            else if (["xls", "xlsx", "csv"].includes(ext)) icon = "📊";
            else if (["zip", "rar", "7z"].includes(ext)) icon = "🗜️";
            else if (["mp3", "wav"].includes(ext)) icon = "🎵";

            return (
              <div
                key={i}
                className="relative w-28 h-28 border rounded-lg bg-gray-50 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all"
              >
                <div className="text-3xl">{icon}</div>
                <p
                  className="text-xs text-gray-700 text-center mt-1 px-1 truncate w-full"
                  title={file.name}
                >
                  {file.name}
                </p>

                {/* Remove button */}
                <button
                  onClick={() => handleDeleteFile(file.name, i)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded px-1 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
