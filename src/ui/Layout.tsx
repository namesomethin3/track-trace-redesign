import { useEffect, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { DISCLAIMER } from '../config'
import { SAMPLE_IDS } from '../data/parcels'
import { useApp } from '../state'
import { Icon } from './Icon'

const SCENARIOS = [
  { n: 1, label: 'In transit, on time', to: `/track/${SAMPLE_IDS.onTime}` },
  { n: 2, label: 'Running late', to: `/track/${SAMPLE_IDS.late}` },
  { n: 3, label: 'Delivered', to: `/track/${SAMPLE_IDS.delivered}` },
  { n: 4, label: 'Shared link', to: `/track/${SAMPLE_IDS.late}?shared=1` },
  { n: 5, label: 'Complaint, pre-filled', to: `/complaint/${SAMPLE_IDS.late}` },
  { n: 6, label: 'Entry', to: '/' },
  { n: 7, label: 'Codes page', to: '/codes' },
]

function Disclaimer() {
  return (
    <div className="bg-ink px-4 py-1.5 text-center text-[0.75rem] leading-snug text-white md:text-[0.8rem]" role="region" aria-label="Disclaimer">
      {DISCLAIMER}
    </div>
  )
}

function PrototypeBar() {
  const { pathname, search } = useLocation()
  const here = pathname + search

  return (
    <div className="on-dark border-b border-black/20 bg-[#2b2b31] text-white" role="region" aria-label="Prototype controls">
      {/* One row on phones (chips scroll sideways) so the bar costs as little height as possible. */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-1.5 md:py-2">
        <nav aria-label="Scenarios" className="min-w-0 flex-1 overflow-x-auto">
          <ul className="flex w-max items-center gap-1.5 md:w-auto md:flex-wrap">
            <li className="pr-1 text-[0.75rem] font-semibold tracking-wide text-white/70 uppercase">Scenario</li>
            {SCENARIOS.map((s) => {
              const active = here === s.to
              return (
                <li key={s.to}>
                  <Link
                    to={s.to}
                    aria-current={active ? 'page' : undefined}
                    className={`block rounded-full border px-3 py-1 text-[0.8rem] whitespace-nowrap ${
                      active ? 'border-white bg-white font-semibold text-ink' : 'border-white/35 text-white hover:bg-white/10'
                    }`}
                  >
                    {s.n}. {s.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}

function SiteHeader() {
  const { lang, setLang, t } = useApp()
  return (
    // Not sticky: the nav can never cover the consignment number (O2).
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 md:py-3">
        <Link to="/" className="flex items-center gap-2.5 rounded">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-maroon-700 text-white md:h-10 md:w-10">
            <Icon name="box" className="h-6 w-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-[1.05rem] font-bold text-maroon-800">Track and Trace</span>
            <span className="block text-[0.75rem] text-muted">Postal tracking · concept</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[0.9rem] font-medium hover:bg-maroon-50"
          lang={lang === 'en' ? 'hi' : 'en'}
        >
          <Icon name="globe" className="h-4 w-4" />
          {lang === 'en' ? 'हिन्दी' : 'English'}
          <span className="sr-only" lang="en">
            (switch language)
          </span>
        </button>
      </div>
      <nav aria-label="Main" className="border-t border-line">
        <ul className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 text-[0.9rem]">
          {[
            { to: '/', label: t.nav.home, end: true },
            { to: '/codes', label: t.nav.codes, end: false },
          ].map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `block border-b-[3px] py-2 whitespace-nowrap md:py-2.5 ${
                    isActive ? 'border-maroon-700 font-semibold text-maroon-800' : 'border-transparent text-ink hover:text-maroon-700'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

/** `compact` trims the band on result pages so the whole status card fits above the fold. */
export function Hero({ title, crumb, compact = false }: { title: string; crumb?: string; compact?: boolean }) {
  const { t } = useApp()
  return (
    <div className="on-dark bg-gradient-to-r from-maroon-950 via-maroon-800 to-maroon-600 text-white">
      <div
        className={`mx-auto max-w-6xl px-4 ${
          compact ? 'flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5 md:py-3' : 'py-5 md:py-7'
        }`}
      >
        <h1 className={`${compact ? 'text-[1.25rem]' : 'text-[1.5rem]'} leading-tight font-semibold`}>{title}</h1>
        <p className={`${compact ? '' : 'mt-1'} text-[0.875rem] text-white/85`}>
          <Link to="/" className="underline underline-offset-2">
            {t.crumbHome}
          </Link>{' '}
          / {crumb ?? title}
        </p>
      </div>
    </div>
  )
}

function Footer() {
  const links = ['About Us', 'Contact Us', 'Privacy Policy', 'Terms & Condition', 'Feedback', 'Help & FAQs', 'Sitemap']
  return (
    <footer className="on-dark mt-12 bg-maroon-800 text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="text-[0.95rem] font-bold tracking-wide uppercase">Useful links</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[0.9rem] sm:grid-cols-4">
            {links.map((l) => (
              <li key={l} className="text-white/90">
                › {l}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.8rem] text-white/75">Footer links are placeholders in this prototype and go nowhere.</p>
        </div>
        <div className="text-[0.85rem] text-white/90 md:text-right">
          <p>{DISCLAIMER}</p>
        </div>
      </div>
    </footer>
  )
}

function ScrollToTop({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, search, hash])
  return <>{children}</>
}

export function Layout() {
  return (
    <ScrollToTop>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Disclaimer />
      <PrototypeBar />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
    </ScrollToTop>
  )
}
