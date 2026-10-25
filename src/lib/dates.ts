// All times are India time stored without a zone. We parse them as UTC and format with
// getUTC* so a reviewer's own timezone (or a DST change) never shifts a scan.
// Dates are always "dd Mon yyyy". Never mm/dd/yyyy.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 86_400_000

export function parse(at: string): Date {
  const [d, t = '00:00:00'] = at.split('T')
  const [y, m, day] = d.split('-').map(Number)
  const [h, mi, s = 0] = t.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, day, h, mi, s))
}

const pad = (n: number) => String(n).padStart(2, '0')

export function fmtDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function fmtTime(d: Date, seconds = false): string {
  const base = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
  return seconds ? `${base}:${pad(d.getUTCSeconds())}` : base
}

export function fmtDateTime(d: Date, seconds = false): string {
  return `${fmtDate(d)}, ${fmtTime(d, seconds)}`
}

/** "22–23 Oct 2026", or "30 Oct – 2 Nov 2026" across months. */
export function fmtRange(a: Date, b: Date): string {
  if (a.getTime() === b.getTime()) return fmtDate(a)
  if (a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear()) {
    return `${a.getUTCDate()}–${fmtDate(b)}`
  }
  return `${a.getUTCDate()} ${MONTHS[a.getUTCMonth()]} – ${fmtDate(b)}`
}

export function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

export function addDays(d: Date, n: number): Date {
  return new Date(startOfDay(d).getTime() + n * DAY_MS)
}

/** Whole calendar days from a to b. */
export function dayDiff(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS)
}

export function hoursBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 3_600_000
}

export function splitHours(hours: number): { days: number; hours: number } {
  const whole = Math.floor(hours)
  return { days: Math.floor(whole / 24), hours: whole % 24 }
}

const NBSP = String.fromCharCode(0xa0) // keeps "29 Oct" on one line
const WJ = String.fromCharCode(0x2060) // word joiner: no break after the dash in "27–28 Oct"

// On the page, the year is dropped when it is the current year: "25 Oct, 14:02".
// The raw scan record keeps full dates.
export function fmtDay(d: Date, now: Date): string {
  return d.getUTCFullYear() === now.getUTCFullYear() ? `${d.getUTCDate()}${NBSP}${MONTHS[d.getUTCMonth()]}` : fmtDate(d)
}

export function fmtDayTime(d: Date, now: Date): string {
  return `${fmtDay(d, now)}, ${fmtTime(d)}`
}

export function fmtDayRange(a: Date, b: Date, now: Date): string {
  if (a.getUTCFullYear() !== now.getUTCFullYear() || b.getUTCFullYear() !== now.getUTCFullYear()) return fmtRange(a, b)
  if (a.getTime() === b.getTime()) return fmtDay(a, now)
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}–${WJ}${fmtDay(b, now)}`
  return `${fmtDay(a, now)} – ${fmtDay(b, now)}`
}
