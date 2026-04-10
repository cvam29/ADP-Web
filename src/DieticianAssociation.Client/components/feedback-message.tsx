"use client";
import { Button } from "@/components/ui/button";

interface FeedbackMessageProps {
  message?: string;
  success?: boolean;
  onClear: () => void;
}

export default function FeedbackMessage({
  message,
  success,
  onClear,
}: FeedbackMessageProps) {
  if (!message || success) return null;

  return (
    <div
      className={`p-2 rounded ${
        success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {message}
      <Button
        onClick={onClear}
        variant="link"
        className="ml-2 text-sm underline"
      >
        Clear
      </Button>
    </div>
  );
}
