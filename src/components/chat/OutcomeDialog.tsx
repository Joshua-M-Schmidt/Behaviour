"use client";

import { Sheet } from "@/components/ui/Sheet";
import type { SessionOutcome } from "@/types";

interface OutcomeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (outcome: SessionOutcome) => void;
}

export function OutcomeDialog({ open, onClose, onSelect }: OutcomeDialogProps) {
  return (
    <Sheet open={open} onClose={onClose} title="End Session">
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">
          How did this session go?
        </p>
        <div className="space-y-2">
          <button
            onClick={() => onSelect("curbed")}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--success-light)] border border-[var(--success)]/20 text-left transition-all active:scale-[0.98]"
          >
            <span className="text-2xl">✅</span>
            <div>
              <div className="text-sm font-semibold">Curbed the urge</div>
              <div className="text-xs text-[var(--text-secondary)]">
                I managed to resist or redirect
              </div>
            </div>
          </button>
          <button
            onClick={() => onSelect("gave_in")}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 text-left transition-all active:scale-[0.98]"
          >
            <span className="text-2xl">🔴</span>
            <div>
              <div className="text-sm font-semibold">Gave in</div>
              <div className="text-xs text-[var(--text-secondary)]">
                That&apos;s okay — every session is progress
              </div>
            </div>
          </button>
          <button
            onClick={() => onSelect("unknown")}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-left transition-all active:scale-[0.98]"
          >
            <span className="text-2xl">⬜</span>
            <div>
              <div className="text-sm font-semibold">Skip</div>
              <div className="text-xs text-[var(--text-secondary)]">
                I&apos;d rather not say right now
              </div>
            </div>
          </button>
        </div>
      </div>
    </Sheet>
  );
}
