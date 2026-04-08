"use client";

import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { useSessions } from "@/hooks/useSessions";
import { UrgeGrid } from "@/components/home/UrgeGrid";
import { QuickActions } from "@/components/home/QuickActions";
import { StatsRibbon } from "@/components/home/StatsRibbon";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const displayName = name ? `, ${name}` : "";
  if (hour < 5) return `Night owl${displayName}`;
  if (hour < 12) return `Good morning${displayName}`;
  if (hour < 17) return `Good afternoon${displayName}`;
  if (hour < 21) return `Good evening${displayName}`;
  return `Good night${displayName}`;
}

export default function HomePage() {
  const { profile } = useProfile();
  const { sessions } = useSessions(5);

  const activeSessions = sessions.filter((s) => !s.endedAt);
  const recentSessions = sessions.filter((s) => s.endedAt);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{getGreeting(profile.name)}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          How are you feeling right now?
        </p>
      </div>

      <StatsRibbon />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Quick launch
        </h2>
        <UrgeGrid />
      </section>

      <QuickActions />

      {activeSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Active sessions
          </h2>
          <div className="space-y-2">
            {activeSessions.map((s) => (
              <Link
                key={s.id}
                href={`/chat/${s.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:shadow-card transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--sage)] animate-pulse-gentle" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.title}</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {new Date(s.startedAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Recent
          </h2>
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <Link
                key={s.id}
                href={`/chat/${s.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:shadow-card transition-all"
              >
                <span className="text-sm">
                  {s.outcome === "curbed"
                    ? "✅"
                    : s.outcome === "gave_in"
                    ? "🔴"
                    : "⬜"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.title}</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {new Date(s.startedAt).toLocaleDateString()} &middot;{" "}
                    {s.messageCount} messages
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!profile.name && (
        <Link
          href="/profile"
          className="block text-center py-3 px-4 rounded-xl bg-[var(--accent-soft)] text-sm text-[var(--text-primary)]"
        >
          Set up your profile to personalize sessions →
        </Link>
      )}
    </div>
  );
}
