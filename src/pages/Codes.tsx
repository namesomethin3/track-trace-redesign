import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Hero } from '../ui/Layout'

type Confidence = 'established' | 'stated' | 'one' | 'unconfirmed' | 'disputed' | 'unknown'

const CHIP: Record<Confidence, [string, string]> = {
  established: ['Established', 'bg-ok-50 text-ok-700'],
  stated: ['Stated by India Post', 'bg-ok-50 text-ok-700'],
  one: ['One report, not a rule', 'bg-tag text-tag-ink'],
  unconfirmed: ['Unconfirmed', 'bg-tag text-tag-ink'],
  disputed: ['Unknown: sources disagree', 'bg-late-50 text-late-700'],
  unknown: ['Unknown', 'bg-page text-muted border border-line'],
}

function Chip({ c }: { c: Confidence }) {
  const [label, cls] = CHIP[c]
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[0.75rem] font-semibold whitespace-nowrap ${cls}`}>{label}</span>
}

const PREFIXES: { code: string; service: string; note: string; c: Confidence }[] = [
  { code: 'CB', service: 'Parcel post (from C)', note: 'Second letter: no official meaning published.', c: 'unknown' },
  { code: 'CG', service: 'Parcel post (from C)', note: 'Second letter: no official meaning published.', c: 'unknown' },
  { code: 'CI', service: 'Parcel post (from C)', note: 'Second letter: no official meaning published.', c: 'unknown' },
  {
    code: 'CS',
    service: 'Parcel post (from C)',
    note: 'Seen on a seller’s receipt booked in Nagaland. Like CX, also booked in Nagaland, so the second letter doesn’t seem to mark the booking circle, as one guide claims.',
    c: 'unknown',
  },
  {
    code: 'CX',
    service: 'Parcel post (from C)',
    note: 'The helpline said one CX parcel was booked as ordinary post, 7–8 days (25 Oct 2026). One case can’t define the prefix.',
    c: 'one',
  },
  { code: 'ED', service: 'EMS / Speed Post (from E)', note: 'Second letter: no official meaning published.', c: 'unknown' },
  {
    code: 'EE',
    service: 'EMS / Speed Post (from E)',
    note: 'Third-party guides contradict each other: one says domestic Speed Post, another international EMS.',
    c: 'disputed',
  },
  { code: 'EY', service: 'EMS / Speed Post (from E)', note: 'Second letter: no official meaning published.', c: 'unknown' },
  {
    code: 'EB',
    service: 'A bank’s bulk booking',
    note: 'The ID is issued before the parcel is physically booked, so tracking can show no record at first. That doesn’t mean the ID is fake.',
    c: 'stated',
  },
]

const TERMS: [string, ReactNode][] = [
  ['IN', 'Country code for India: the last two letters of every S10 ID.'],
  [
    'S.O',
    <>
      Sub Post Office. Also <strong>H.O</strong> = Head Post Office, <strong>B.O</strong> = Branch Post Office.
    </>,
  ],
  ['PH', 'Parcel Hub: a parcel sorting centre.'],
  ['TMO', 'Transit Mail Office: moves mail bags between cities.'],
  ['Transshipment Centre', 'Where bags move from one transport route to another.'],
]

function downloadCsv() {
  const rows = [['prefix', 'service', 'note', 'confidence'], ...PREFIXES.map((p) => [p.code, p.service, p.note, CHIP[p.c][0]])]
  const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'tracking-id-prefixes-prototype.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const card = 'rounded-xl border border-line bg-white p-4 shadow-sm md:p-6'
const ext = 'font-medium text-maroon-800 underline underline-offset-2'

export default function Codes() {
  return (
    <>
      <Hero title="What do these codes mean?" />
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-6">
        <section className={card}>
          <p className="text-[1.05rem]">
            You don’t need this page to track a parcel: the tracking page names the service in words. This is a reference for
            sellers, helpline staff and tracking apps.
          </p>
          <p className="mt-2 text-[0.9rem] text-muted">
            In the redesign, India Post publishes this list officially, also as open data. This prototype shows only what is
            established and marks everything else <strong>Unknown</strong>.
          </p>
        </section>

        <section className={card} aria-labelledby="anatomy-h">
          <h2 id="anatomy-h" className="text-[1.15rem] font-bold">
            How a tracking ID is built
          </h2>
          <p className="mt-3 flex flex-wrap items-stretch gap-1 font-mono text-[1.5rem] font-bold tracking-wide" aria-hidden="true">
            <span className="rounded bg-maroon-100 px-2">CX</span>
            <span className="rounded bg-page px-2">006233096</span>
            <span className="rounded bg-ok-50 px-2">IN</span>
          </p>
          <ul className="mt-3 space-y-1">
            <li>
              <strong>First two letters:</strong> the service code. The first letter follows the Universal Postal Union’s S10
              standard; the second is assigned by each country.
            </li>
            <li>
              <strong>Digits:</strong> identify the item. Their structure isn’t covered on this page.
            </li>
            <li>
              <strong>Last two letters:</strong> the country (see terms below).
            </li>
          </ul>
        </section>

        <section className={card} aria-labelledby="first-h">
          <h2 id="first-h" className="text-[1.15rem] font-bold">
            The first letter
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[0.85rem] text-muted">
                <tr>
                  <th scope="col" className="py-2 pr-3">Letter</th>
                  <th scope="col" className="py-2 pr-3">Means</th>
                  <th scope="col" className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="py-2 pr-3 font-mono font-bold">C</td>
                  <td className="py-2 pr-3">Parcel post</td>
                  <td className="py-2"><Chip c="established" /></td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-mono font-bold">E</td>
                  <td className="py-2 pr-3">EMS, which India sells as Speed Post</td>
                  <td className="py-2"><Chip c="established" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={card} aria-labelledby="prefix-h">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="prefix-h" className="text-[1.15rem] font-bold">
              Prefixes seen so far
            </h2>
            <button type="button" onClick={downloadCsv} className="rounded-md border border-maroon-700 px-3 py-1.5 text-[0.85rem] font-semibold text-maroon-800 hover:bg-maroon-50">
              Download as CSV
            </button>
          </div>
          <p className="mt-1 text-[0.9rem] text-muted">
            India Post has not published a list of second letters. These are the prefixes from one buyer’s parcels and receipts.
          </p>
          <ul className="mt-3 divide-y divide-line">
            {PREFIXES.map((p) => (
              <li key={p.code} className="grid gap-1 py-3 sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-3">
                <span className="font-mono text-[1.2rem] font-bold">{p.code}</span>
                <span>
                  <span className="font-semibold">{p.service}</span>
                  <span className="block text-[0.9rem] text-muted">{p.note}</span>
                </span>
                <span>
                  <Chip c={p.c} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={card} aria-labelledby="receipt-h">
          <h2 id="receipt-h" className="text-[1.15rem] font-bold">
            Codes on the counter receipt
          </h2>
          <ul className="mt-3 divide-y divide-line">
            <li className="grid gap-1 py-3 sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-3">
              <span className="font-mono text-[1.2rem] font-bold">IPP-C</span>
              <span>
                <span className="font-semibold">Appears to match “India Post Parcel - Contractual”</span>
                <span className="block text-[0.9rem] text-muted">
                  Printed before the ID on a receipt; the name matches an option on the complaint form.
                </span>
              </span>
              <span>
                <Chip c="unconfirmed" />
              </span>
            </li>
          </ul>
        </section>

        <section id="terms" className={`${card} scroll-mt-4`} aria-labelledby="terms-h">
          <h2 id="terms-h" className="text-[1.15rem] font-bold">
            Terms on this page
          </h2>
          <p className="mt-1 inline-block rounded-md bg-page px-2 py-1 text-[0.85rem] text-muted">
            General India Post terminology, not findings from this research.
          </p>
          <dl className="mt-3 divide-y divide-line">
            {TERMS.map(([term, def]) => (
              <div key={term} className="grid gap-1 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-3">
                <dt className="font-mono font-bold">{term}</dt>
                <dd>{def}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={card} aria-labelledby="src-h">
          <h2 id="src-h" className="text-[1.15rem] font-bold">
            Sources
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem]">
            <li>
              <a className={ext} href="https://en.wikipedia.org/wiki/S10_(UPU_standard)" target="_blank" rel="noreferrer">
                Wikipedia: S10 (UPU standard)
              </a>{' '}
              (first letter)
            </li>
            <li>
              <a className={ext} href="https://x.com/IndiaPostOffice/status/1877600151034040379" target="_blank" rel="noreferrer">
                India Post on X
              </a>{' '}
              (EB)
            </li>
            <li>
              <a className={ext} href="https://www.ship24.com/couriers/india-post-tracking/india-post-tracking-number" target="_blank" rel="noreferrer">
                Ship24
              </a>{' '}
              and{' '}
              <a className={ext} href="https://www.speedindiapost.com/blog/india-post-consignment-number-explained" target="_blank" rel="noreferrer">
                SpeedIndiaPost
              </a>{' '}
              (third-party guides that disagree on EE)
            </li>
            <li>The India Post helpline, called 25 Oct 2026 (CX)</li>
          </ul>
          <Link to="/" className="mt-4 inline-block font-semibold text-maroon-800 underline underline-offset-4">
            Back to tracking
          </Link>
        </section>
      </div>
    </>
  )
}
