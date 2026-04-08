"use client";

import { useState, useEffect } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";

interface SystemPromptSheetProps {
  open: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSave: (prompt: string, saveToTemplate: boolean) => void;
}

export function SystemPromptSheet({
  open,
  onClose,
  currentPrompt,
  onSave,
}: SystemPromptSheetProps) {
  const [value, setValue] = useState(currentPrompt);

  useEffect(() => {
    if (open) setValue(currentPrompt);
  }, [open, currentPrompt]);

  const hasChanges = value !== currentPrompt;

  return (
    <Sheet open={open} onClose={onClose} title="System Prompt">
      <div className="space-y-4">
        <p className="text-xs text-[var(--text-secondary)]">
          Edit the system prompt to adjust how the AI responds. Changes can be
          saved for this session only, or applied to the template for all future
          sessions of this type.
        </p>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full h-64 bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-[var(--accent)]/30 resize-none font-mono leading-relaxed"
        />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasChanges}
            onClick={() => {
              onSave(value, false);
              onClose();
            }}
            className="flex-1"
          >
            Save for session
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!hasChanges}
            onClick={() => {
              onSave(value, true);
              onClose();
            }}
            className="flex-1"
          >
            Save to template
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
