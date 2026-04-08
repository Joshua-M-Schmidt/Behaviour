"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSessions } from "@/hooks/useSessions";
import { useUrges } from "@/hooks/useUrges";
import type { SessionOutcome } from "@/types";

export default function HistoryPage() {
  const { sessions, deleteSession } = useSessions();
  const { urges } = useUrges();
  const [filterUrge, setFilterUrge] = useState<string | null>(null);
  const [filterOutcome, setFilterOutcome] = useState<SessionOutcome | null>(
    null
  );

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (filterUrge && s.urgeId !== filterUrge) return false;
      if (filterOutcome && s.outcome !== filterOutcome) return false;
      return true;
    });
  }, [sessions, filterUrge, filterOutcome]);

  const grouped = useMemo(() => {
    const groups: { date: string; sessions: typeof filtered }[] = [];
    let currentDate = "";
    let currentGroup: typeof filtered = [];

    for (const s of filtered) {
      const date = new Date(s.startedAt).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      if (date !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, sessions: currentGroup });
        }
        currentDate = date;
        currentGroup = [s];
      } else {
        currentGroup.push(s);
      }
    }
    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, sessions: currentGroup });
    }
    return groups;
  }, [filtered]);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this session and all its messages?")) {
      await deleteSession(id);
    }
  };

  return (
    <div>
      <PageHeader title="History" />
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <FilterChip
            label="All"
            active={!filterOutcome && !filterUrge}
            onClick={() => {
              setFilterOutcome(null);
              setFilterUrge(null);
            }}
          />
          <FilterChip
            label="✅ Curbed"
            active={filterOutcome === "curbed"}
            onClick={() =>
              setFilterOutcome(
                filterOutcome === "curbed" ? null : "curbed"
              )
            }
          />
          <FilterChip
            label="🔴 Gave in"
            active={filterOutcome === "gave_in"}
            onClick={() =>
              setFilterOutcome(
                filterOutcome === "gave_in" ? null : "gave_in"
              )
            }
          />
          {urges.map((u) => (
            <FilterChip
              key={u.id}
              label={`${u.icon} ${u.name}`}
              active={filterUrge === u.id}
              onClick={() =>
                setFilterUrge(filterUrge === u.id ? null : u.id)
              }
            />
          ))}
        </div>

        {grouped.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm text-[var(--text-secondary)]">
              No sessions yet. Start one from the home page.
            </p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.date} className="space-y-2">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {group.date}
            </h3>
            {group.sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-fade-in-up"
              >
                <span className="text-sm">
                  {s.outcome === "curbed"
                    ? "✅"
                    : s.outcome === "gave_in"
                    ? "🔴"
                    : "⬜"}
                </span>
                <Link
                  href={`/chat/${s.id}`}
                  className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <div className="text-sm font-medium truncate">
                    {s.title}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {new Date(s.startedAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    &middot; {s.messageCount} messages
                    {s.endedAt && (
                      <>
                        {" "}
                        &middot;{" "}
                        {Math.round(
                          (s.endedAt - s.startedAt) / 60000
                        )}
                        m
                      </>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-2 rounded-lg hover:bg-[var(--error)]/10 transition-colors text-[var(--text-muted)] hover:text-[var(--error)]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-[var(--accent)] text-[var(--color-midnight)]"
          : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]"
      }`}
    >
      {label}
    </button>
  );
}
