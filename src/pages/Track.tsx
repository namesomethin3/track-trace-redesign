import { Fragment, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { findParcel, type Parcel } from '../data/parcels'
import { fmtDateTime, fmtDay, fmtDayRange, fmtDayTime, fmtTime, parse, splitHours } from '../lib/dates'
import { cityOf } from '../lib/places'
import { deriveStatus, GAP_MARK_HOURS, groupJourney, type JourneyGroup, type Status } from '../lib/status'
import type { Strings } from '../i18n'
import { useApp } from '../state'
import { Hero } from '../ui/Layout'
import { Icon, type IconName } from '../ui/Icon'
import { OfficeName } from '../ui/OfficeName'
import { Tip } from '../ui/Tip'
import { Toast, useToast } from '../ui/Toast'

// Header card type scale: XL 1.875rem (the date, always largest), L 1.25rem (location), S 0.875rem.
// Body text elsewhere is 1rem. Weights: 400 and 600.
const S = 'text-[0.875rem]'
const L = 'text-[1.25rem] leading-tight'
const XL = 'text-[1.875rem] leading-none'
const card = 'rounded-xl border border-line bg-white p-4 shadow-sm md:p-6'

// Three step states, shared by the progress bar and the journey so they visibly match.
// Completed = green, current = maroon (larger), upcoming = grey outline with dashed connector.
const DOT = {
  done: 'h-6 w-6 bg-ok-700 text-white',
  current: 'h-7 w-7 bg-maroon-700 ring-4 ring-maroon-100',
  upcoming: 'h-6 w-6 border-2 border-step bg-white',
}

function StepDot({ state }: { state: keyof typeof DOT }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full ${DOT[state]}`}>
      {state === 'done' && <Icon name="check" className="h-3.5 w-3.5" />}
      {state === 'current' && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
    </span>
  )
}

export default function Track() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { t } = useApp()
  const toast = useToast()
  const parcel = findParcel(id)
  const shared = params.get('shared') === '1'

  if (!parcel) return <NotFound id={id ?? ''} />

  const s = deriveStatus(parcel)
  const within = s.timing === 'within'
  return (
    <>
      <Hero title={t.pageTitle} compact />
      <div className="mx-auto max-w-6xl space-y-5 px-4 pt-3 pb-6 md:py-5">
        <StatusCard parcel={parcel} s={s} shared={shared} toast={toast.show} />
        {s.timing === 'late' && <LatePanel parcel={parcel} s={s} toast={toast.show} />}
        {/* Phones: "If it's late" sits right under the header. Desktop: top of the right column. */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_1fr] lg:items-start">
          {within && (
            <div className="lg:col-start-2 lg:row-start-1">
              <IfLate s={s} />
            </div>
          )}
          <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <Journey parcel={parcel} s={s} />
          </div>
          <div className={`lg:col-start-2 ${within ? 'lg:row-start-2' : 'lg:row-start-1'}`}>
            <Details parcel={parcel} s={s} shared={shared} />
          </div>
        </div>
      </div>
      <Toast msg={toast.msg} />
    </>
  )
}

function duration(t: Strings, hours: number, short = false) {
  const d = splitHours(hours)
  return short ? t.durationShort(d.days, d.hours) : t.duration(d.days, d.hours)
}

function fullHeadline(t: Strings, s: Status): string {
  const l = s.location
  switch (l.kind) {
    case 'booked':
      return t.headline.booked(l.office)
    case 'left':
      return t.headline.left(l.city, l.destCity)
    case 'at':
      return t.headline.at(l.city, l.destCity)
    case 'atDest':
      return t.headline.atDest(l.office)
    case 'outForDelivery':
      return t.headline.outForDelivery(l.office)
    case 'delivered':
      return t.headline.delivered(l.office)
  }
}

type Tone = 'ok' | 'warn'
const TINT: Record<Tone, { box: string; pill: string }> = {
  ok: { box: 'bg-ok-50', pill: 'bg-ok-100 text-ok-700' },
  warn: { box: 'bg-warn-50 border border-warn-100', pill: 'bg-warn-100 text-warn-800' },
}

interface CardProps {
  parcel: Parcel
  s: Status
  shared: boolean
  toast: (m: string) => void
}

function StatusCard({ parcel, s, shared, toast }: CardProps) {
  const { t } = useApp()
  const delivered = s.stage === 4
  const late = s.timing === 'late' || s.timing === 'deliveredLate'
  const tone: Tone = late ? 'warn' : 'ok'
  const range = fmtDayRange(s.windowStart, s.windowEnd, s.asOf)
  const pill = late ? t.pill.late : t.pill.onTime
  const deliveredDay = s.location.kind === 'delivered' ? fmtDay(s.location.at, s.asOf) : ''

  const pillEl = <span className={`${S} rounded-full px-2.5 py-0.5 font-semibold ${TINT[tone].pill}`}>{pill}</span>

  const serviceLine = (
    <p className={`${S} flex flex-wrap items-center gap-x-1.5 text-muted`}>
      {t.service[parcel.service]} · {t.usuallyDays(parcel.normMin, parcel.normMax)}
      <Tip
        plain
        label={t.howTitle}
        trigger={<Icon name="info" className="h-4 w-4" />}
        tip={
          <>
            <span className="font-semibold">{t.howTitle}</span>
            <br />
            {t.how(fmtDay(s.booked, s.asOf), parcel.normMin, parcel.normMax, parcel.normSource)}
          </>
        }
      />
    </p>
  )

  const lastScan = !delivered && t.lastScanAgo(duration(t, s.hoursSinceLast))

  const actions = !delivered && <Actions parcel={parcel} shared={shared} toast={toast} />

  return (
    <section className={card} aria-labelledby="status-h">
      {shared && <SharedLine parcel={parcel} />}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <span className={`${S} font-mono text-muted`}>{parcel.id}</span>
          <CopyId id={parcel.id} toast={toast} />
        </div>
        <div className="hidden sm:block">{actions}</div>
      </div>

      <div className={`mt-2 rounded-lg px-3.5 py-3 md:mt-3 md:px-4 md:py-3.5 ${TINT[tone].box}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h2 id="status-h" className={`${XL} flex items-center gap-2 font-semibold`}>
            {delivered && <Icon name="check" className="h-7 w-7 text-ok-700" />}
            <span>{delivered ? t.deliveredOnDate(deliveredDay) : t.expected(range)}</span>
          </h2>
          {pillEl}
        </div>
        <div className="mt-2.5">{serviceLine}</div>
      </div>

      <div className="mt-3 md:mt-4">
        <p className={`${L} font-semibold`}>{fullHeadline(t, s)}</p>
        {lastScan && <p className={`${S} mt-1 text-muted`}>{lastScan}</p>}
      </div>
      <ProgressBlock stage={s.stage} />
      {/* Phones: actions sit under the progress bar; wider screens: top right. */}
      {actions && <div className="mt-3 sm:hidden">{actions}</div>}
    </section>
  )
}

/** On-time parcels: complaints open only after the norm, so show when, not a live button. */
function IfLate({ s }: { s: Status }) {
  const { t } = useApp()
  const opens = fmtDay(s.complaintOpens, s.asOf)
  return (
    <section className={card} aria-labelledby="iflate-h">
      <h2 id="iflate-h" className="font-semibold">
        {t.ifLate.title}
      </h2>
      <p className={`${S} mt-1`}>{t.ifLate.body(fmtDay(s.windowEnd, s.asOf), opens)}</p>
      <button
        type="button"
        disabled
        className="mt-3 w-full cursor-not-allowed rounded-lg border border-dashed border-step bg-page px-4 py-2.5 font-semibold text-muted"
      >
        {t.late.complaint}
      </button>
      <p className={`${S} mt-1.5 text-center text-muted`}>{t.ifLate.availableFrom(opens)}</p>
    </section>
  )
}

function SharedLine({ parcel }: { parcel: Parcel }) {
  const { t } = useApp()
  return (
    <>
      <p className={`${S} mb-2 flex items-center gap-1.5 text-muted`}>
        <Icon name="link" className="h-4 w-4" />
        {t.shared.heading} · {t.shared.for} <span className="font-mono text-ink">{parcel.recipientMasked}</span>
      </p>
    </>
  )
}

function CopyId({ id, toast }: { id: string; toast: (m: string) => void }) {
  const { t } = useApp()
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id)
      toast(t.idCopied)
    } catch {
      /* clipboard blocked; the number is selectable text */
    }
  }
  return (
    <button type="button" onClick={copy} aria-label={t.copyId} className="rounded-md p-1.5 text-muted hover:bg-page hover:text-ink">
      <Icon name="copy" className="h-4 w-4" />
    </button>
  )
}

function ProgressBlock({ stage }: { stage: number }) {
  return (
    <div className="mt-4 md:mt-5">
      <Progress stage={stage} />
    </div>
  )
}

function Progress({ stage }: { stage: number }) {
  const { t } = useApp()
  const allDone = stage === 4
  return (
    <ol aria-label={t.progressLabel} className="-mx-3 grid grid-cols-5 md:mx-0">
      {t.stages.map((label, i) => {
        const state = i < stage || allDone ? 'done' : i === stage ? 'current' : 'upcoming'
        return (
          <li key={label} className="relative flex flex-col items-center text-center" aria-current={state === 'current' ? 'step' : undefined}>
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute top-[13px] ${i <= stage ? 'h-0.5 bg-ok-700' : 'border-t-2 border-dashed border-step'}`}
                style={{ left: 'calc(-50% + 16px)', right: 'calc(50% + 16px)' }}
              />
            )}
            <span className="relative z-10 flex h-7 items-center">
              <StepDot state={state} />
            </span>
            <span
              className={`${S} mt-1.5 px-1 leading-tight ${
                state === 'current' ? 'font-semibold text-maroon-800' : state === 'done' ? '' : 'text-muted'
              }`}
            >
              {label}
              <span className="sr-only">: {state === 'done' ? t.done : state === 'current' ? t.current : t.notYet}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Actions({ parcel, shared, toast }: { parcel: Parcel; shared: boolean; toast: (m: string) => void }) {
  const { t, saved, toggleSaved } = useApp()
  const isSaved = saved.includes(parcel.id)
  const [texts, setTexts] = useState(false)
  const link = `${window.location.origin}/track/${parcel.id}?shared=1`

  const save = () => {
    toggleSaved(parcel.id)
    toast(isSaved ? t.actions.toastUnsaved : t.actions.toastSaved)
  }
  const share = async () => {
    try {
      await navigator.clipboard.writeText(link)
      toast(t.actions.toastCopied)
    } catch {
      toast(t.actions.toastCopyFailed(link))
    }
  }
  const text = () => {
    setTexts(!texts)
    toast(texts ? t.actions.toastTextOff : t.actions.toastTextOn(parcel.mobileMasked))
  }

  const btn = (on: boolean) =>
    `${S} inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 leading-tight font-semibold sm:px-2.5 sm:whitespace-nowrap ${
      on ? 'border-maroon-700 bg-maroon-50 text-maroon-800' : 'border-line text-maroon-800 hover:bg-maroon-50'
    }`

  return (
    <div>
      {/* Phones: three equal columns, so all actions fit in one row. */}
      <div className={`grid gap-1.5 sm:flex sm:flex-wrap ${shared ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <button type="button" aria-pressed={isSaved} onClick={save} className={btn(isSaved)}>
          <Icon name="bookmark" className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? t.actions.saved : t.actions.save}
        </button>
        {!shared && (
          <button type="button" onClick={share} className={btn(false)}>
            <Icon name="link" className="h-4 w-4" /> {t.actions.share}
          </button>
        )}
        <button type="button" role="switch" aria-checked={texts} onClick={text} className={btn(texts)}>
          <Icon name={texts ? 'check' : 'chat'} className="h-4 w-4" />
          {texts ? t.actions.textOn : t.actions.text}
          <span className="sr-only">: {t.actions.textLabel(parcel.mobileMasked)}</span>
        </button>
      </div>
    </div>
  )
}

/** One option in the late panel: icon + title, short details, action pinned to the bottom. */
function LateOption({ icon, title, children, action }: { icon: IconName; title: string; children: ReactNode; action: ReactNode }) {
  return (
    <li className="flex flex-col rounded-lg bg-page p-3.5">
      <p className="flex items-center gap-1.5 font-semibold">
        <Icon name={icon} className="h-4 w-4 text-maroon-700" /> {title}
      </p>
      <div className="mt-1">{children}</div>
      <div className="mt-auto pt-3">{action}</div>
    </li>
  )
}

function LatePanel({ parcel, s, toast }: { parcel: Parcel; s: Status; toast: (m: string) => void }) {
  const { t } = useApp()
  const link = `${S} inline-flex items-center gap-1 rounded font-semibold text-maroon-800 underline underline-offset-4`
  return (
    <section className={`${card} border-l-4 border-l-warn-600`} aria-labelledby="late-h">
      <h2 id="late-h" className="font-semibold">
        {t.late.title}
      </h2>
      <p className={`${S} mt-0.5 text-muted`}>{t.late.intro}</p>
      {/* Equal-height cards: the grid stretches each item; actions sit at the bottom. */}
      <ul className="mt-3 grid gap-3 md:grid-cols-3 md:gap-4">
        <LateOption
          icon="pin"
          title={t.late.office}
          action={
            <button type="button" onClick={() => toast(t.late.callToast)} className={link}>
              <Icon name="phone" className="h-4 w-4" /> {t.late.officeAction}
            </button>
          }
        >
          <p>
            <OfficeName name={parcel.dest.office} />
          </p>
          <p className={`${S} text-muted`}>{parcel.dest.area}</p>
        </LateOption>
        <LateOption
          icon="phone"
          title={t.late.helpline}
          action={
            <button type="button" onClick={() => toast(t.late.callToast)} className={link}>
              <Icon name="phone" className="h-4 w-4" /> {t.late.helplineAction}
              <span className="sr-only"> 1800 266 6868</span>
            </button>
          }
        >
          <p className="tracking-wide">1800 266 6868</p>
          <p className={`${S} text-muted`}>{t.late.helplineHint}</p>
        </LateOption>
        <LateOption
          icon="chat"
          title={t.late.complaint}
          action={
            <Link
              to={`/complaint/${parcel.id}`}
              className={`${S} inline-flex items-center gap-1.5 rounded-lg border border-maroon-700 bg-white px-3 py-2 font-semibold text-maroon-800 hover:bg-maroon-50`}
            >
              {t.late.complaint} <Icon name="arrow" className="h-4 w-4" />
            </Link>
          }
        >
          <p className={`${S} text-muted`}>{t.late.complaintHint(fmtDay(s.complaintCloses, s.asOf))}</p>
          {parcel.service === 'speedpost' && <p className={`${S} text-muted`}>{t.late.refund}</p>}
        </LateOption>
      </ul>
    </section>
  )
}

function groupSentence(t: Strings, g: JourneyGroup, destCity: string): string {
  if (g.kind === 'dest') return g.delivered ? t.j.destDelivered : g.outForDelivery ? t.j.destOut : t.j.destArrived
  if (g.kind === 'origin') return g.dispatched ? t.j.originSent(g.nextCity ?? destCity) : t.j.originWaiting
  if (!g.dispatched) return t.j.hubWaiting
  return g.nextCity ? t.j.hubSent(g.nextCity) : t.j.hubSentToward(destCity)
}

function groupWhen(g: JourneyGroup, now: Date): string {
  if (fmtDay(g.first, now) === fmtDay(g.last, now)) {
    const a = fmtTime(g.first)
    const b = fmtTime(g.last)
    return a === b ? fmtDayTime(g.first, now) : `${fmtDay(g.first, now)}, ${a}–${b}`
  }
  return `${fmtDayTime(g.first, now)} – ${fmtDayTime(g.last, now)}`
}

function Offices({ names }: { names: string[] }) {
  return (
    <>
      {names.map((o, i) => (
        <Fragment key={o}>
          {i > 0 && ', '}
          <OfficeName name={o} />
        </Fragment>
      ))}
    </>
  )
}

// The timeline rail sits under the centre of a 28px dot column.
const RAIL = 'absolute left-[13px] w-0'
const DONE_RAIL = `${RAIL} border-l-2 border-ok-700`
const NEXT_RAIL = `${RAIL} border-l-2 border-dashed border-step`

function Row({ dot, rail, children, current }: { dot: keyof typeof DOT; rail?: string; children: ReactNode; current?: boolean }) {
  return (
    <li className="relative pb-4 pl-10" aria-current={current ? 'location' : undefined}>
      {rail && <span aria-hidden="true" className={`${rail} top-7 bottom-0`} />}
      <span className="absolute top-0 left-0 flex w-7 justify-center">
        <StepDot state={dot} />
      </span>
      {children}
    </li>
  )
}

function Journey({ parcel, s }: { parcel: Parcel; s: Status }) {
  const { t } = useApp()
  const [showRaw, setShowRaw] = useState(false)
  const groups = groupJourney(parcel)
  const destCity = cityOf(parcel.dest.office)
  const delivered = s.stage === 4
  const raw = [...parcel.scans].reverse()

  return (
    <section className={card} aria-labelledby="journey-h">
      <h2 id="journey-h" className="font-semibold">
        {t.journey}
      </h2>

      <ol className="mt-4">
        {groups.map((g, i) => {
          const isLast = i === groups.length - 1
          const current = isLast && !delivered
          return (
            <Fragment key={g.city + i}>
              {g.gapBefore !== undefined && g.gapBefore > GAP_MARK_HOURS && (
                <li className="relative flex items-center py-1 pl-10" aria-label={t.j.gapLabel(duration(t, g.gapBefore))}>
                  <span aria-hidden="true" className={`${DONE_RAIL} top-0 bottom-0`} />
                  <span aria-hidden="true" className="absolute left-0 flex w-7 justify-center">
                    <span className="rounded-full bg-white p-0.5 text-muted">
                      <Icon name="clock" className="h-4 w-4" />
                    </span>
                  </span>
                  <span aria-hidden="true" className={`${S} text-muted`}>
                    {t.j.gapLabel(duration(t, g.gapBefore, true))}
                  </span>
                </li>
              )}
              <Row dot={current ? 'current' : 'done'} rail={isLast && delivered ? undefined : current ? NEXT_RAIL : DONE_RAIL} current={current}>
                <p>
                  <span className="font-semibold">{g.city}</span>
                  <span className={`${S} text-muted`}>
                    {' · '}
                    <Offices names={g.offices} />
                  </span>
                </p>
                <p>{groupSentence(t, g, destCity)}</p>
                <p className={`${S} text-muted`}>{groupWhen(g, s.asOf)}</p>
              </Row>
            </Fragment>
          )
        })}
        {!delivered && (
          <>
            <li className="relative pb-4 pl-10">
              <span aria-hidden="true" className={`${NEXT_RAIL} top-0 bottom-0`} />
              <p className={`${S} rounded-lg border border-maroon-100 bg-maroon-50 px-3 py-2`}>
                <span className="font-semibold">{t.gap.current(duration(t, s.hoursSinceLast))}</span>{' '}
                <span className="text-muted">{t.gap.explain}</span>
              </p>
            </li>
            <Row dot="upcoming">
              <p>
                <span className="font-semibold">{destCity}</span>
                <span className={`${S} text-muted`}>
                  {' · '}
                  <OfficeName name={parcel.dest.office} />
                </span>
              </p>
              <p className={`${S} text-muted`}>{t.j.notReached}</p>
            </Row>
          </>
        )}
      </ol>

      <div className="mt-2 border-t border-line pt-4">
        <button
          type="button"
          aria-expanded={showRaw}
          aria-controls="raw-log"
          onClick={() => setShowRaw((v) => !v)}
          className={`${S} inline-flex items-center gap-1.5 rounded-md font-semibold text-maroon-800`}
        >
          <Icon name="chevron" className={`h-4 w-4 transition-transform ${showRaw ? 'rotate-90' : ''}`} />
          {showRaw ? t.hideAll : t.showAll(parcel.scans.length)}
        </button>
        <div id="raw-log" hidden={!showRaw} className="mt-3">
          <p className={`${S} text-muted`}>{t.rawIntro}</p>
          <ol className={`${S} mt-2 divide-y divide-line rounded-lg border border-line`} lang="en">
            {raw.map((scan) => (
              <li key={scan.at} className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between">
                <span>
                  <span className="font-semibold">{scan.event}</span>
                  <span className="block text-muted">{scan.office}</span>
                </span>
                <span className="font-mono whitespace-nowrap">{fmtDateTime(parse(scan.at), true)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Details({ parcel, s, shared }: { parcel: Parcel; s: Status; shared: boolean }) {
  const { t } = useApp()
  const row = 'flex flex-col py-2.5'
  const dt = `${S} text-muted`
  const code = parcel.id.slice(0, 2)
  return (
    <section className={card} aria-labelledby="details-h">
      <h2 id="details-h" className="font-semibold">
        {t.details}
      </h2>
      <dl className="mt-1 divide-y divide-line">
        <div className={row}>
          <dt className={dt}>{t.bookedAt}</dt>
          <dd>
            <OfficeName name={parcel.origin.office} />
            <span className={`${S} block text-muted`}>
              {parcel.origin.state} {parcel.origin.pin}
            </span>
          </dd>
        </div>
        <div className={row}>
          <dt className={dt}>{t.bookedOn}</dt>
          <dd>{fmtDayTime(s.booked, s.asOf)}</dd>
        </div>
        <div className={row}>
          <dt className={dt}>{t.destination}</dt>
          <dd>
            <OfficeName name={parcel.dest.office} />
            <span className={`${S} block text-muted`}>
              {parcel.dest.state} {parcel.dest.pin}
            </span>
          </dd>
        </div>
        {!shared && (
          <div className={row}>
            <dt className={dt}>{t.tariff}</dt>
            <dd>{parcel.tariff}</dd>
          </div>
        )}
        <div className={row}>
          <dt className={dt}>{t.code}</dt>
          <dd>
            <span className="font-mono font-semibold">{code}</span> ·{' '}
            <Link to="/codes" className="text-maroon-800 underline underline-offset-4">
              {t.codeLink}
            </Link>
          </dd>
        </div>
      </dl>
    </section>
  )
}

function NotFound({ id }: { id: string }) {
  const isEB = id.toUpperCase().startsWith('EB')
  return (
    <>
      <Hero title="Track and Trace" compact />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className={card}>
          <h2 className="font-semibold">No record for {id || 'this ID'}</h2>
          {isEB ? (
            <p className="mt-2">
              IDs starting with <strong className="font-semibold">EB</strong> can be issued for a bank’s bulk booking before
              the parcel is physically booked, so there may be no record yet. That doesn’t mean the ID is fake.
            </p>
          ) : (
            <p className="mt-2">This prototype only has sample parcels. Try one from the entry page.</p>
          )}
          <Link to="/" className="mt-4 inline-block font-semibold text-maroon-800 underline underline-offset-4">
            Back to tracking
          </Link>
        </div>
      </div>
    </>
  )
}
