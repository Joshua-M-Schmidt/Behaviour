"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useStats } from "@/hooks/useStats";

export default function StatsPage() {
  const { stats, isLoading } = useStats();

  const calendarWeeks = useMemo(() => {
    if (stats.calendarData.length === 0) return [];

    const today = new Date();
    const weeks: { date: string; count: number }[][] = [];
    const dataMap = new Map(stats.calendarData.map((d) => [d.date, d.count]));

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 83);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentWeek: { date: string; count: number }[] = [];
    const cursor = new Date(startDate);

    while (cursor <= today) {
      const dateStr = cursor.toISOString().split("T")[0];
      currentWeek.push({ date: dateStr, count: dataMap.get(dateStr) ?? 0 });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return weeks;
  }, [stats.calendarData]);

  const maxCount = useMemo(() => {
    return Math.max(1, ...stats.calendarData.map((d) => d.count));
  }, [stats.calendarData]);

  if (isLoading) return null;

  return (
    <div>
      <PageHeader title="Statistics" />
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Overview cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total sessions" value={stats.totalSessions} />
          <StatCard
            label="Curb rate"
            value={`${Math.round(stats.curbRate)}%`}
            accent
          />
          <StatCard label="Urges curbed" value={stats.totalCurbed} />
          <StatCard label="Current streak" value={`${stats.currentStreak}d`} />
        </div>

        {/* Calendar heatmap */}
        {calendarWeeks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Activity
            </h2>
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-[3px]">
                {calendarWeeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day) => {
                      const intensity =
                        day.count === 0 ? 0 : Math.ceil((day.count / maxCount) * 4);
                      return (
                        <div
                          key={day.date}
                          className="w-3 h-3 rounded-[2px]"
                          title={`${day.date}: ${day.count} sessions`}
                          style={{
                            backgroundColor:
                              intensity === 0
                                ? "var(--bg-tertiary)"
                                : intensity === 1
                                ? "var(--color-sage-light)"
                                : intensity === 2
                                ? "var(--color-sage)"
                                : intensity === 3
                                ? "#4a9d6e"
                                : "#2d7a4a",
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Per-urge breakdown */}
        {stats.byUrge.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              By urge
            </h2>
            <div className="space-y-3">
              {stats.byUrge
                .filter((u) => u.sessions > 0)
                .sort((a, b) => b.sessions - a.sessions)
                .map((u) => (
                  <div
                    key={u.urgeId}
                    className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {u.urgeIcon} {u.urgeName}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        {u.sessions} sessions
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${u.curbRate}%`,
                          backgroundColor:
                            u.curbRate >= 70
                              ? "var(--success)"
                              : u.curbRate >= 40
                              ? "var(--accent)"
                              : "var(--error)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-[var(--text-muted)]">
                      <span>
                        {u.curbed} curbed / {u.gaveIn} gave in
                      </span>
                      <span>{Math.round(u.curbRate)}% curb rate</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {stats.totalSessions === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm text-[var(--text-secondary)]">
              No data yet. Complete some sessions to see your stats.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
      <div
        className={`text-2xl font-bold ${
          accent ? "text-[var(--accent)]" : ""
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-[var(--text-secondary)] mt-1">{label}</div>
    </div>
  );
}
