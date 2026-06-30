'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AICoverLetterModal } from '@/components/ai/AICoverLetterModal';

interface AICoverLetterButtonProps {
  gigId: string;
  gigTitle: string;
}

export function AICoverLetterButton({ gigId, gigTitle }: AICoverLetterButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Generate AI Cover Letter"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-bold transition-all hover:scale-105"
      >
        <Sparkles className="w-3 h-3" />
        AI Letter
      </button>

      {open && (
        <AICoverLetterModal
          gigId={gigId}
          gigTitle={gigTitle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
