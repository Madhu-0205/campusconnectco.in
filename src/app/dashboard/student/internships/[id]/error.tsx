"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex flex-col items-center max-w-md text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="font-black text-white mb-2">Something went wrong!</h2>
        <p className="text-sm mb-6">
          {error.message || "We encountered an unexpected error loading this internship."}
        </p>
        <Button
          onClick={() => reset()}
          className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold px-6 py-2"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
