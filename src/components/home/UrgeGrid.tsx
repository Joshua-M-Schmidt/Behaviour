"use client";

import { useRouter } from "next/navigation";
import { useUrges } from "@/hooks/useUrges";
import { useSessions } from "@/hooks/useSessions";
import type { Urge } from "@/types";

export function UrgeGrid() {
  const { urges } = useUrges();
  const { createSession } = useSessions();
  const router = useRouter();

  const handleUrgeClick = async (urge: Urge) => {
    const sessionId = await createSession("cbt-default", urge.id);
    router.push(`/chat/${sessionId}`);
  };

  if (urges.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-[var(--text-secondary)] text-sm">
          No urges added yet. Go to Urges to add your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {urges.map((urge, i) => (
        <button
          key={urge.id}
          onClick={() => handleUrgeClick(urge)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl min-h-[88px] transition-all active:scale-[0.96] hover:shadow-card animate-fade-in-up"
          style={{
            background: `${urge.color}18`,
            borderLeft: `3px solid ${urge.color}`,
            animationDelay: `${i * 50}ms`,
          }}
        >
          <span className="text-3xl">{urge.icon}</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {urge.name}
          </span>
        </button>
      ))}
    </div>
  );
}
