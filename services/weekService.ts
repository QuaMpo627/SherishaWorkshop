import { WeekRange } from './types';

/**
 * Workshop week: Friday 00:00 -> Thursday 23:59
 * Returns the WeekRange that contains the given date.
 */
export function getWorkshopWeek(date: Date = new Date()): WeekRange {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun .. 5=Fri .. 6=Sat
  // We want week to start on Friday (5). Compute days since last Friday.
  const daysSinceFriday = (day - 5 + 7) % 7;
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysSinceFriday);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setMilliseconds(end.getMilliseconds() - 1);

  return {
    start: start.getTime(),
    end: end.getTime(),
    key: weekKeyFromDate(start),
    label: formatRange(start, end),
  };
}

export function weekKeyFromDate(date: Date): string {
  const y = date.getFullYear();
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - oneJan.getTime()) / 86400000);
  const week = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return `${y}-W${String(week).padStart(2, '0')}`;
}

function formatRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString(undefined, opts)} - ${end.toLocaleDateString(undefined, opts)}`;
}

export function getPreviousWeek(week: WeekRange): WeekRange {
  const prevDate = new Date(week.start - 1);
  return getWorkshopWeek(prevDate);
}

export function isInWeek(timestamp: number, week: WeekRange): boolean {
  return timestamp >= week.start && timestamp <= week.end;
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
