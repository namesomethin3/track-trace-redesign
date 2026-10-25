import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { findParcel } from '../data/parcels'
import { cityOf } from '../lib/places'
import { deriveStatus } from '../lib/status'
import { useApp } from '../state'
import { Hero } from '../ui/Layout'
import { Icon } from '../ui/Icon'

// Mock captcha: any non-empty answer is accepted in the prototype.
const CODES = ['B7K3L', 'R4XM9', 'H2PQ7', 'W8NC5']

function CaptchaImage({ code }: { code: string }) {
  return (
    <svg viewBox="0 0 150 48" className="h-12 w-[150px] shrink-0 rounded-md border border-line bg-[#f3f1ea]" role="img" aria-label="Captcha image">
      <path d="M4 30 Q40 8 76 26 T146 18" stroke="#9a948a" strokeWidth="1.5" fill="none" />
      <path d="M6 12 Q50 40 96 20 T148 36" stroke="#b5afa4" strokeWidth="1" fill="none" />
      {code.split('').map((ch, i) => (
        <text
          key={i}
          x={16 + i * 26}
          y={i % 2 ? 34 : 30}
          transform={`rotate(${[-12, 9, -6, 14, -9][i]} ${16 + i * 26} 30)`}
          fontFamily="Georgia, serif"
          fontSize="24"
          fontStyle="italic"
          fill="#2b2b31"
        >
          {ch}
        </text>
      ))}
    </svg>
  )
}

function StatusPill({ id }: { id: string }) {
  const { t } = useApp()
  const p = findParcel(id)
  if (!p) return null
  const s = deriveStatus(p)
  const delivered = s.stage === 4
  const late = s.timing === 'late' || s.timing === 'deliveredLate'
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.875rem] font-semibold ${
        late ? 'bg-warn-100 text-warn-800' : 'bg-ok-100 text-ok-700'
      }`}
    >
      {delivered && <Icon name="check" className="h-3.5 w-3.5" />}
      {delivered ? t.pill.delivered : late ? t.pill.late : t.pill.onTime}
    </span>
  )
}

export default function Entry() {
  const { saved, toggleSaved, t, recent, addRecent, clearRecent } = useApp()
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [codeIndex, setCodeIndex] = useState(0)
  const [captcha, setCaptcha] = useState('')
  const [audioMsg, setAudioMsg] = useState('')
  const code = CODES[codeIndex]

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const clean = id.replace(/\s/g, '').toUpperCase()
    if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(clean)) {
      setError('Enter the 13-character number from your receipt or the seller’s message, like CX006233096IN.')
      return
    }
    if (!captcha.trim()) {
      setError('Enter the characters shown in the image.')
      return
    }
    setError('')
    if (findParcel(clean)) addRecent(clean)
    navigate(`/track/${clean}`)
  }

  const refresh = () => {
    setCodeIndex((i) => (i + 1) % CODES.length)
    setCaptcha('')
    setAudioMsg('New characters shown.')
  }

  const playAudio = () => {
    try {
      const u = new SpeechSynthesisUtterance(code.split('').join(', '))
      u.rate = 0.7
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
      setAudioMsg('Playing the characters.')
    } catch {
      setAudioMsg('Audio isn’t available in this browser.')
    }
  }

  const iconBtn = 'grid h-11 w-11 place-items-center rounded-lg border border-line text-maroon-800 hover:bg-maroon-50'

  return (
    <>
      <Hero title="Track a parcel" crumb="Track and Trace" />
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section className="rounded-xl border border-line bg-white p-4 shadow-sm md:p-6" aria-labelledby="entry-h">
          <h2 id="entry-h" className="text-[1.2rem] font-bold">
            Where is my parcel?
          </h2>
          <form onSubmit={submit} className="mt-3" noValidate>
            <label htmlFor="cid" className="block font-semibold">
              Consignment number
            </label>
            <p id="cid-hint" className="text-[0.9rem] text-muted">
              13 characters, e.g. CX006233096IN
            </p>
            <input
              id="cid"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={`cid-hint${error ? ' entry-err' : ''}`}
              className="mt-2 w-full rounded-lg border-2 border-[#8a8a94] px-3 py-3 font-mono text-[1.15rem] tracking-wide uppercase"
            />

            <fieldset className="mt-4">
              <legend className="font-semibold">Security check</legend>
              <div className="mt-2 flex items-center gap-2">
                <CaptchaImage code={code} />
                <button type="button" onClick={refresh} aria-label="Show new characters" title="Show new characters" className={iconBtn}>
                  <Icon name="refresh" />
                </button>
                <button type="button" onClick={playAudio} aria-label="Play the characters as audio" title="Play as audio" className={iconBtn}>
                  <Icon name="volume" />
                </button>
              </div>
              <p className="sr-only" aria-live="polite">
                {audioMsg}
              </p>
              <label htmlFor="cap" className="mt-3 block text-[0.9rem] font-semibold">
                Enter the characters shown
              </label>
              <input
                id="cap"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-describedby={error ? 'entry-err' : undefined}
                className="mt-1 w-full max-w-[16rem] rounded-lg border-2 border-[#8a8a94] px-3 py-2.5 font-mono tracking-wide uppercase"
              />
            </fieldset>

            {error && (
              <p id="entry-err" role="alert" className="mt-3 font-medium text-late-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-maroon-700 px-6 py-3 font-semibold text-white hover:bg-maroon-800 sm:w-auto"
            >
              <Icon name="search" /> Track
            </button>
          </form>

          <div className="mt-6 border-t border-line pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 id="recent-h" className="font-semibold">
                Recent searches <span className="text-[0.875rem] font-normal text-muted">on this device</span>
              </h3>
              {recent.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecent}
                  className="rounded text-[0.875rem] text-muted underline underline-offset-2 hover:text-ink"
                >
                  Clear<span className="sr-only"> recent searches</span>
                </button>
              )}
            </div>
            {recent.length === 0 ? (
              <p className="mt-2 text-[0.875rem] text-muted">Parcels you track appear here.</p>
            ) : (
              <ul aria-labelledby="recent-h" className="mt-2 divide-y divide-line rounded-lg border border-line">
                {recent.map((rid) => {
                  const p = findParcel(rid)
                  return (
                    <li key={rid}>
                      {/* Phones: number on top, route + status below. Wider: one line. */}
                      <Link to={`/track/${rid}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-page">
                        <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                          <span className="font-mono font-semibold">{rid}</span>
                          <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                            {p && (
                              <span className="min-w-0 truncate text-[0.875rem] text-muted">
                                <span className="hidden sm:inline">· </span>
                                {cityOf(p.origin.office)} → {cityOf(p.dest.office)}
                              </span>
                            )}
                            <StatusPill id={rid} />
                          </span>
                        </span>
                        <Icon name="chevron" className="h-4 w-4 text-muted" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-4 shadow-sm md:p-6" aria-labelledby="saved-h">
          <h2 id="saved-h" className="flex items-center gap-2 text-[1.1rem] font-bold">
            <Icon name="bookmark" className="text-maroon-700" /> Your saved parcels
          </h2>
          {saved.length === 0 ? (
            <p className="mt-2 text-muted">
              Parcels you save appear here, on this device only. Open a parcel and choose “{t.actions.save}”.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {saved.map((sid) => {
                const p = findParcel(sid)
                const s = p && deriveStatus(p)
                const late = s?.timing === 'late'
                return (
                  <li key={sid} className="flex items-center gap-2 rounded-lg border border-line p-3">
                    <Link to={`/track/${sid}`} className="min-w-0 flex-1 rounded">
                      <span className="block font-mono font-semibold">{sid}</span>
                      {s && (
                        <span className={`text-[0.85rem] ${late ? 'font-semibold text-late-700' : 'text-muted'}`}>
                          {s.stage === 4 ? t.pill.delivered : late ? t.pill.late : t.pill.onTime}
                        </span>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSaved(sid)}
                      className="rounded-md px-2 py-1 text-[0.85rem] text-muted underline underline-offset-2 hover:text-ink"
                    >
                      Remove<span className="sr-only"> {sid}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
