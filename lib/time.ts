import {
  DAY_MS,
  ISO_WEEK_THURSDAY,
  RELATIVE_DAY_COUNT_TOKEN,
  RELATIVE_DAY_FUTURE,
  RELATIVE_DAY_TODAY,
  RELATIVE_DAY_TOMORROW,
  WEEK_DAYS,
} from "@/lib/constants";

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isoWeek(date: Date): number {
  const target = new Date(startOfUtcDay(date));
  const weekday = target.getUTCDay() || WEEK_DAYS;
  target.setUTCDate(target.getUTCDate() + ISO_WEEK_THURSDAY - weekday);

  const yearStart = Date.UTC(target.getUTCFullYear(), 0, 1);
  const dayOfYear = (target.getTime() - yearStart) / DAY_MS + 1;
  return Math.ceil(dayOfYear / WEEK_DAYS);
}

export function daysUntil(isoDate: string, from = new Date()): number | null {
  const target = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(target)) return null;
  return Math.round((target - startOfUtcDay(from)) / DAY_MS);
}

export function relativeDayLabel(days: number): string {
  if (days <= 0) return RELATIVE_DAY_TODAY;
  if (days === 1) return RELATIVE_DAY_TOMORROW;
  return RELATIVE_DAY_FUTURE.replace(RELATIVE_DAY_COUNT_TOKEN, String(days));
}
