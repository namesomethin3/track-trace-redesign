import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findParcel, type Parcel } from '../data/parcels'
import { fmtDate, fmtDateTime } from '../lib/dates'
import { deriveStatus, type Status } from '../lib/status'
import { useApp } from '../state'
import { Hero } from '../ui/Layout'
import { Icon } from '../ui/Icon'

// Option names as they appear on India Post's Complaint Registration form.
const CATEGORIES = ['Domestic Mail Services', 'Domestic Parcel Services']
const PARCEL_SERVICES = [
  '24 Speed Post Parcel',
  '24 Speed Post Special Parcel',
  'India Post Parcel - Contractual',
  'India Post Parcel - Retail',
  'Speed Post Parcel',
]
const TYPES = [
  'Abstraction of contents',
  'Damage of article',
  'Delay in delivery',
  'Fake/Non-updation of delivery remarks/Scan',
  'Loss of article',
  'Non delivery of article',
  'Non payment of COD amount',
  'Non receipt of Proof of Delivery (POD)',
]

const input = 'w-full rounded-md border border-[#8a8a94] bg-white px-3 py-2.5'
const filled = 'border-ok-700 bg-ok-50'

export default function Complaint() {
  const { id } = useParams()
  const parcel = findParcel(id)
  if (!parcel)
    return (
      <>
        <Hero title="Raise a complaint" />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <p>No sample parcel with this ID. <Link to="/" className="font-semibold text-maroon-800 underline">Back to tracking</Link></p>
        </div>
      </>
    )
  const s = deriveStatus(parcel)
  return (
    <>
      <Hero title="Raise a complaint" crumb="Track and Trace / Raise a complaint" />
      <div className="mx-auto max-w-3xl px-4 py-6">
        {s.timing === 'within' ? <NotYet parcel={parcel} s={s} /> : <Form parcel={parcel} s={s} />}
      </div>
    </>
  )
}

function NotYet({ parcel, s }: { parcel: Parcel; s: Status }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <h2 className="text-[1.2rem] font-bold">Complaints for {parcel.id} open on {fmtDate(s.complaintOpens)}</h2>
      <p className="mt-2">
        This parcel is still within its usual window ({fmtDate(s.windowStart)} to {fmtDate(s.windowEnd)}). If it hasn’t
        arrived by then, come back from {fmtDate(s.complaintOpens)} and the form will be filled in for you.
      </p>
      <Link to={`/track/${parcel.id}`} className="mt-4 inline-block font-semibold text-maroon-800 underline underline-offset-4">
        Back to tracking
      </Link>
    </section>
  )
}

function Field({ label, htmlFor, hint, children, auto }: { label: string; htmlFor: string; hint?: ReactNode; children: ReactNode; auto?: boolean }) {
  const hintId = `${htmlFor}-hint`
  return (
    <div>
      <label htmlFor={htmlFor} className="flex flex-wrap items-center gap-2 font-semibold">
        {label}
        {auto && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ok-50 px-2 py-0.5 text-[0.75rem] font-medium text-ok-700">
            <Icon name="check" className="h-3.5 w-3.5" /> From tracking
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-[0.85rem] text-muted">
          {hint}
        </p>
      )}
      <div className="mt-1">{children}</div>
    </div>
  )
}

function Form({ parcel, s }: { parcel: Parcel; s: Status }) {
  const { t } = useApp()
  const [category, setCategory] = useState('Domestic Parcel Services')
  const [service, setService] = useState('')
  const [type, setType] = useState(s.timing === 'late' ? 'Delay in delivery' : '')
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const services = category === 'Domestic Parcel Services' ? PARCEL_SERVICES : []

  const defaultText =
    s.timing === 'late'
      ? `My parcel ${parcel.id} (${t.service[parcel.service]}) was booked at ${parcel.origin.office} on ${fmtDate(s.booked)} for ${parcel.dest.office} (${parcel.dest.pin}). It is usually delivered by ${fmtDate(s.windowEnd)} and has not arrived. Last scan: ${s.last.event}, ${s.last.office}, ${fmtDateTime(s.lastAt)}.`
      : `My parcel ${parcel.id} was delivered on ${fmtDate(s.lastAt)} at ${parcel.dest.office}.`

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs = []
    if (!service) errs.push('Choose the service.')
    if (!type) errs.push('Choose the complaint type.')
    setErrors(errs)
    if (!errs.length) setSent(true)
  }

  if (sent)
    return (
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm" role="status">
        <h2 className="flex items-center gap-2 text-[1.2rem] font-bold text-ok-700">
          <Icon name="check" /> Ready to hand over
        </h2>
        <p className="mt-2">
          In the live version, this is where India Post’s existing complaint system takes over, with everything above already
          filled in.
        </p>
        <p className="mt-2 font-medium">Prototype: nothing was sent and nothing was stored.</p>
        <Link to={`/track/${parcel.id}`} className="mt-4 inline-block font-semibold text-maroon-800 underline underline-offset-4">
          Back to tracking
        </Link>
      </section>
    )

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <section className="rounded-xl border border-line bg-white p-4 shadow-sm md:p-6" aria-labelledby="about-h">
        <p className="text-[0.85rem] text-muted">Complaint about</p>
        <h2 id="about-h" className="font-mono text-[1.35rem] font-bold tracking-wide">
          {parcel.id}
        </h2>
        <p className="mt-1">
          {t.service[parcel.service]} · {parcel.origin.office} → {parcel.dest.office}
        </p>
        <p className={`mt-2 text-[0.95rem] font-medium ${s.timing === 'late' ? 'text-late-700' : ''}`}>
          {s.timing === 'late'
            ? `Usually delivered by ${fmtDate(s.windowEnd)}. ${s.daysLate} ${s.daysLate === 1 ? 'day' : 'days'} past its usual window.`
            : `Delivered on ${fmtDate(s.lastAt)}.`}
        </p>
        <p className="mt-1 text-[0.9rem] text-muted">
          Complaints accepted until {fmtDate(s.complaintCloses)} (60 days from booking).
          {parcel.service === 'speedpost' && ' Speed Post refunds its charge if delivery is late.'}
        </p>
      </section>

      <section className="space-y-4 rounded-xl border border-line bg-white p-4 shadow-sm md:p-6" aria-labelledby="form-h">
        <h2 id="form-h" className="text-[1.15rem] font-bold">
          Complaint details
        </h2>
        <p className="text-[0.9rem] text-muted">Fields marked “From tracking” are filled in for you. You can change them.</p>

        <Field label="Category" htmlFor="cat" auto>
          <select id="cat" value={category} onChange={(e) => { setCategory(e.target.value); setService('') }} className={`${input} ${filled}`}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field
          label="Service"
          htmlFor="svc"
          hint={
            category === 'Domestic Parcel Services' ? (
              <>
                Booking record says: <strong className="text-ink">{t.service[parcel.service]}</strong>. Which option below that
                matches isn’t published (see{' '}
                <Link to="/codes" className="underline underline-offset-2">codes</Link>), so this prototype doesn’t guess. In the
                live version the booking record would fill it.
              </>
            ) : (
              'The four mail service names are not included in this prototype.'
            )
          }
        >
          <select id="svc" value={service} onChange={(e) => setService(e.target.value)} className={input} aria-describedby="svc-hint" aria-invalid={errors.includes('Choose the service.')}>
            <option value="">Choose a service</option>
            {services.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>

        <Field label="Type" htmlFor="type" auto={!!type && s.timing === 'late'}>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)} className={`${input} ${type ? filled : ''}`} aria-invalid={errors.includes('Choose the complaint type.')}>
            <option value="">Choose a type</option>
            {TYPES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>

        <Field label="Article ID" htmlFor="aid" auto>
          <input id="aid" value={parcel.id} readOnly className={`${input} ${filled} font-mono`} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Booking office" htmlFor="bo" auto>
            <input id="bo" value={`${parcel.origin.office} (${parcel.origin.pin})`} readOnly className={`${input} ${filled}`} />
          </Field>
          <div>
            <Field label="Booking date" htmlFor="bd" auto>
              <input id="bd" value={fmtDate(s.booked)} readOnly className={`${input} ${filled}`} />
            </Field>
          </div>
        </div>

        <Field label="Delivery office" htmlFor="do" auto>
          <input id="do" value={`${parcel.dest.office} (${parcel.dest.pin})`} readOnly className={`${input} ${filled}`} />
        </Field>

        <Field label="What happened" htmlFor="desc" hint="Written for you from the tracking record. Add anything else you know.">
          <textarea id="desc" rows={5} defaultValue={defaultText} aria-describedby="desc-hint" className={input} />
        </Field>

        <div>
          <Field label="Attach a file (optional)" htmlFor="file" hint="Not required. You don’t need the booking receipt; the tracking record already identifies the parcel.">
            <input id="file" type="file" aria-describedby="file-hint" className="block w-full text-[0.9rem] file:mr-3 file:rounded-md file:border-0 file:bg-maroon-50 file:px-3 file:py-2 file:font-semibold file:text-maroon-800" />
          </Field>
        </div>

        {errors.length > 0 && (
          <ul role="alert" className="rounded-md bg-late-50 p-3 font-medium text-late-700">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-maroon-700 px-6 py-3 font-semibold text-white hover:bg-maroon-800 sm:w-auto">
          Continue <Icon name="arrow" />
        </button>
        <p className="text-[0.85rem] text-muted">
          The complaint system itself is unchanged and may ask you to sign in. Prototype: nothing is sent.
        </p>
      </section>
    </form>
  )
}
