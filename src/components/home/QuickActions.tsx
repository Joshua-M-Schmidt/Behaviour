"use client";

import { useRouter } from "next/navigation";
import { useSessions } from "@/hooks/useSessions";

export function QuickActions() {
  const { createSession } = useSessions();
  const router = useRouter();

  const handleCalmDown = async () => {
    const sessionId = await createSession("calm-default", null);
    router.push(`/chat/${sessionId}`);
  };

  const handleFallAsleep = async () => {
    const sessionId = await createSession("sleep-default", null);
    router.push(`/chat/${sessionId}`);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleCalmDown}
        className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all active:scale-[0.97] hover:shadow-card"
      >
        <span className="text-2xl">🌊</span>
        <div className="text-left">
          <div className="text-sm font-semibold">Calm Down</div>
          <div className="text-xs text-[var(--text-secondary)]">
            Breathing & grounding
          </div>
        </div>
      </button>
      <button
        onClick={handleFallAsleep}
        className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all active:scale-[0.97] hover:shadow-card"
      >
        <span className="text-2xl">🌙</span>
        <div className="text-left">
          <div className="text-sm font-semibold">Fall Asleep</div>
          <div className="text-xs text-[var(--text-secondary)]">
            Relaxation & body scan
          </div>
        </div>
      </button>
    </div>
  );
}
