"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export interface StatsData {
  totalSessions: number;
  totalCurbed: number;
  totalGaveIn: number;
  curbRate: number;
  todaySessions: number;
  todayCurbed: number;
  currentStreak: number;
  byUrge: {
    urgeId: string;
    urgeName: string;
    urgeIcon: string;
    sessions: number;
    curbed: number;
    gaveIn: number;
    curbRate: number;
  }[];
  calendarData: { date: string; count: number }[];
}

export function useStats(): { stats: StatsData; isLoading: boolean } {
  const stats = useLiveQuery(async () => {
    const [allStats, urges, sessions] = await Promise.all([
      db.dailyStats.toArray(),
      db.urges.toArray(),
      db.chatSessions.toArray(),
    ]);

    const today = new Date().toISOString().split("T")[0];

    let totalSessions = 0;
    let totalCurbed = 0;
    let totalGaveIn = 0;
    let todaySessions = 0;
    let todayCurbed = 0;

    const byUrgeMap = new Map<
      string,
      { sessions: number; curbed: number; gaveIn: number }
    >();

    const dailyMap = new Map<string, number>();

    for (const stat of allStats) {
      totalSessions += stat.sessionsStarted;
      totalCurbed += stat.sessionsCurbed;
      totalGaveIn += stat.sessionsGaveIn;

      if (stat.date === today) {
        todaySessions += stat.sessionsStarted;
        todayCurbed += stat.sessionsCurbed;
      }

      if (stat.urgeId !== "general") {
        const existing = byUrgeMap.get(stat.urgeId) ?? {
          sessions: 0,
          curbed: 0,
          gaveIn: 0,
        };
        existing.sessions += stat.sessionsStarted;
        existing.curbed += stat.sessionsCurbed;
        existing.gaveIn += stat.sessionsGaveIn;
        byUrgeMap.set(stat.urgeId, existing);
      }

      const prev = dailyMap.get(stat.date) ?? 0;
      dailyMap.set(stat.date, prev + stat.sessionsStarted);
    }

    const resolved = totalCurbed + totalGaveIn;
    const curbRate = resolved > 0 ? (totalCurbed / resolved) * 100 : 0;

    const byUrge = urges.map((u) => {
      const data = byUrgeMap.get(u.id) ?? { sessions: 0, curbed: 0, gaveIn: 0 };
      const urgeResolved = data.curbed + data.gaveIn;
      return {
        urgeId: u.id,
        urgeName: u.name,
        urgeIcon: u.icon,
        sessions: data.sessions,
        curbed: data.curbed,
        gaveIn: data.gaveIn,
        curbRate: urgeResolved > 0 ? (data.curbed / urgeResolved) * 100 : 0,
      };
    });

    // Streak: consecutive days with at least one session
    const sortedDates = [...dailyMap.keys()].sort().reverse();
    let currentStreak = 0;
    const todayDate = new Date();
    for (let i = 0; i < sortedDates.length; i++) {
      const expected = new Date(todayDate);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (sortedDates[i] === expectedStr) {
        currentStreak++;
      } else {
        break;
      }
    }

    const calendarData = [...dailyMap.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSessions,
      totalCurbed,
      totalGaveIn,
      curbRate,
      todaySessions,
      todayCurbed,
      currentStreak,
      byUrge,
      calendarData,
    };
  });

  return {
    stats: stats ?? {
      totalSessions: 0,
      totalCurbed: 0,
      totalGaveIn: 0,
      curbRate: 0,
      todaySessions: 0,
      todayCurbed: 0,
      currentStreak: 0,
      byUrge: [],
      calendarData: [],
    },
    isLoading: stats === undefined,
  };
}
