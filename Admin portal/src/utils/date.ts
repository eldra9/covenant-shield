/**
 * Date and East Africa Time (EAT, UTC+3) utilities
 * All internal records are stored in UTC ISO format and displayed in EAT.
 */

// East Africa Time is UTC+3 hours
const EAT_OFFSET_HOURS = 3;

export function nowUTC(): string {
  return new Date().toISOString();
}

/**
 * Parses UTC string and formats to East Africa Time (UTC+3)
 */
export function formatEAT(
  utcDateString?: string | null,
  includeTime = true
): string {
  if (!utcDateString) return '—';
  try {
    const date = new Date(utcDateString);
    if (isNaN(date.getTime())) return utcDateString;

    // Use Intl.DateTimeFormat with Africa/Nairobi timezone
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Nairobi',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(includeTime
        ? {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }
        : {}),
    });

    const formatted = formatter.format(date);
    return includeTime ? `${formatted} EAT` : formatted;
  } catch {
    return utcDateString;
  }
}

export function formatEATDate(utcDateString?: string | null): string {
  return formatEAT(utcDateString, false);
}

export function formatEATTime(utcDateString?: string | null): string {
  if (!utcDateString) return '—';
  try {
    const date = new Date(utcDateString);
    if (isNaN(date.getTime())) return '—';

    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${formatter.format(date)} EAT`;
  } catch {
    return '—';
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD in East Africa Time
 */
export function getTodayEAT(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // e.g. "2026-10-29"
}

/**
 * Evaluates whether two shifts for the same guard overlap.
 * date: YYYY-MM-DD
 * startTime: HH:mm (e.g. "06:00")
 * endTime: HH:mm (e.g. "18:00")
 */
export function doShiftsOverlap(
  dateA: string,
  startA: string,
  endA: string,
  dateB: string,
  startB: string,
  endB: string
): boolean {
  if (dateA !== dateB) {
    // If different days, check cross-midnight shifts
    return false;
  }
  const [hA1, mA1] = startA.split(':').map(Number);
  const [hA2, mA2] = endA.split(':').map(Number);
  const [hB1, mB1] = startB.split(':').map(Number);
  const [hB2, mB2] = endB.split(':').map(Number);

  const startMinutesA = hA1 * 60 + mA1;
  let endMinutesA = hA2 * 60 + mA2;
  if (endMinutesA <= startMinutesA) endMinutesA += 24 * 60; // overnight

  const startMinutesB = hB1 * 60 + mB1;
  let endMinutesB = hB2 * 60 + mB2;
  if (endMinutesB <= startMinutesB) endMinutesB += 24 * 60;

  return startMinutesA < endMinutesB && startMinutesB < endMinutesA;
}

/**
 * Calculates rest period in hours between two shift intervals.
 */
export function getRestPeriodHours(
  shift1EndDateTime: string,
  shift2StartDateTime: string
): number {
  const d1 = new Date(shift1EndDateTime).getTime();
  const d2 = new Date(shift2StartDateTime).getTime();
  const diffHours = (d2 - d1) / (1000 * 60 * 60);
  return Math.round(diffHours * 10) / 10;
}
