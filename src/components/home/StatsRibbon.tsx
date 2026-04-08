"use client";

import { useStats } from "@/hooks/useStats";

export function StatsRibbon() {
  const { stats } = useStats();

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
      <StatItem label="Today" value={stats.todaySessions} />
      <div className="w-px h-8 bg-[var(--border-color)]" />
      <StatItem label="Curbed" value={stats.todayCurbed} />
      <div className="w-px h-8 bg-[var(--border-color)]" />
      <StatItem
        label="Curb rate"
        value={`${Math.round(stats.curbRate)}%`}
      />
      <div className="w-px h-8 bg-[var(--border-color)]" />
      <StatItem label="Streak" value={`${stats.currentStreak}d`} />
    </div>
  );
}

function StatItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex-1 text-center">
      <div className="text-lg font-bold text-[var(--accent)]">{value}</div>
      <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
