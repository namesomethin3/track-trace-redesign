// One function derives everything the summary shows from the scan log, so the status sentence,
// the progress bar and the current location can never disagree with the log (change 2, P2).

import type { Parcel, Scan } from '../data/parcels'
import { addDays, dayDiff, hoursBetween, parse } from './dates'
import { cityOf } from './places'

export type Stage = 0 | 1 | 2 | 3 | 4 // Booked, Dispatched, In transit, Out for delivery, Delivered

export type Location =
  | { kind: 'booked'; office: string; at: Date }
  | { kind: 'left'; city: string; at: Date; destCity: string }
  | { kind: 'at'; city: string; office: string; at: Date; destCity: string }
  | { kind: 'atDest'; office: string; at: Date }
  | { kind: 'outForDelivery'; office: string; at: Date }
  | { kind: 'delivered'; office: string; at: Date }

export type Timing = 'within' | 'late' | 'deliveredOnTime' | 'deliveredLate'

export interface Status {
  stage: Stage
  location: Location
  last: Scan
  lastAt: Date
  asOf: Date
  hoursSinceLast: number
  booked: Date
  windowStart: Date
  windowEnd: Date
  timing: Timing
  daysLate: number
  complaintOpens: Date
  complaintCloses: Date
  complaintOpenNow: boolean
}

const is = (s: Scan, re: RegExp) => re.test(s.event)
const DISPATCHED = /dispatched/i
const OUT = /out for delivery/i
const DELIVERED = /^item delivered$/i

export function deriveStatus(p: Parcel): Status {
  const scans = p.scans
  const last = scans[scans.length - 1]
  const lastAt = parse(last.at)
  const asOf = parse(p.asOf)
  const booked = parse(scans[0].at)
  const destCity = cityOf(p.dest.office)

  const deliveredScan = scans.find((s) => is(s, DELIVERED))
  const outScan = scans.find((s) => is(s, OUT))
  const leftOrigin = scans.some((s) => s.office === p.origin.office && is(s, DISPATCHED))
  // The rule is printed under the progress bar: "In transit" turns on at the first scan
  // anywhere other than the booking office.
  const pastOrigin = scans.some((s) => s.office !== p.origin.office)

  const stage: Stage = deliveredScan ? 4 : outScan ? 3 : pastOrigin ? 2 : leftOrigin ? 1 : 0

  let location: Location
  if (deliveredScan) location = { kind: 'delivered', office: deliveredScan.office, at: parse(deliveredScan.at) }
  else if (outScan && last.office === p.dest.office) location = { kind: 'outForDelivery', office: last.office, at: lastAt }
  else if (last.office === p.dest.office) location = { kind: 'atDest', office: last.office, at: lastAt }
  else if (is(last, DISPATCHED)) location = { kind: 'left', city: cityOf(last.office), at: lastAt, destCity }
  else if (last.office === p.origin.office) location = { kind: 'booked', office: last.office, at: lastAt }
  else location = { kind: 'at', city: cityOf(last.office), office: last.office, at: lastAt, destCity }

  const windowStart = addDays(booked, p.normMin)
  const windowEnd = addDays(booked, p.normMax)
  let timing: Timing
  let daysLate = 0
  if (deliveredScan) {
    const d = parse(deliveredScan.at)
    daysLate = Math.max(0, dayDiff(windowEnd, d))
    timing = daysLate > 0 ? 'deliveredLate' : 'deliveredOnTime'
  } else {
    daysLate = Math.max(0, dayDiff(windowEnd, asOf))
    timing = daysLate > 0 ? 'late' : 'within'
  }

  // India Post's complaint rule: only after the delivery norm expires, within 60 days.
  const complaintOpens = addDays(windowEnd, 1)
  const complaintCloses = addDays(booked, 60)
  const complaintOpenNow = asOf >= complaintOpens && asOf < addDays(complaintCloses, 1)

  return {
    stage,
    location,
    last,
    lastAt,
    asOf,
    hoursSinceLast: hoursBetween(lastAt, asOf),
    booked,
    windowStart,
    windowEnd,
    timing,
    daysLate,
    complaintOpens,
    complaintCloses,
    complaintOpenNow,
  }
}

export type GroupKind = 'origin' | 'hub' | 'dest'

export interface JourneyGroup {
  city: string
  kind: GroupKind
  offices: string[]
  scans: Scan[]
  first: Date
  last: Date
  dispatched: boolean
  outForDelivery: boolean
  delivered: boolean
  /** City of the next group, if the log has one. Never guessed. */
  nextCity?: string
  /** Silence before this group, in hours, from the previous group's last scan. */
  gapBefore?: number
}

/** Groups consecutive scans by city, oldest first. The raw log is untouched (change 3). */
export function groupJourney(p: Parcel): JourneyGroup[] {
  const groups: JourneyGroup[] = []
  for (const s of p.scans) {
    const city = cityOf(s.office)
    let g = groups[groups.length - 1]
    if (!g || g.city !== city) {
      const kind: GroupKind =
        s.office === p.origin.office ? 'origin' : s.office === p.dest.office ? 'dest' : 'hub'
      g = {
        city,
        kind,
        offices: [],
        scans: [],
        first: parse(s.at),
        last: parse(s.at),
        dispatched: false,
        outForDelivery: false,
        delivered: false,
      }
      if (groups.length) g.gapBefore = hoursBetween(groups[groups.length - 1].last, g.first)
      groups.push(g)
    }
    if (!g.offices.includes(s.office)) g.offices.push(s.office)
    g.scans.push(s)
    g.last = parse(s.at)
    // A later receive scan in the same city means it hasn't left yet.
    g.dispatched = is(s, DISPATCHED) ? true : is(s, /received/i) ? false : g.dispatched
    if (is(s, OUT)) g.outForDelivery = true
    if (is(s, DELIVERED)) g.delivered = true
  }
  groups.forEach((g, i) => (g.nextCity = groups[i + 1]?.city))
  return groups
}

/** Past gaps are shown only when longer than this (2 days); shorter ones are hidden entirely. */
export const GAP_MARK_HOURS = 48
