import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SAMPLE_IDS } from './data/parcels'
import { STRINGS, type Lang, type Strings } from './i18n'

// Browser storage is a per-viewer convenience only; every read and write is guarded.
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function store(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode or blocked storage: the page still works */
  }
}

interface AppState {
  lang: Lang
  setLang: (l: Lang) => void
  t: Strings
  saved: string[]
  toggleSaved: (id: string) => void
  recent: string[]
  addRecent: (id: string) => void
  clearRecent: () => void
}

// Pre-populated so reviewers can click straight into each scenario.
const DEFAULT_RECENT = [SAMPLE_IDS.onTime, SAMPLE_IDS.late, SAMPLE_IDS.delivered]

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => load('tt-lang', 'en'))
  const [saved, setSaved] = useState<string[]>(() => load('tt-saved', []))
  const [recent, setRecent] = useState<string[]>(() => load('tt-recent', DEFAULT_RECENT))

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    store('tt-lang', l)
  }, [])
  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]
      store('tt-saved', next)
      return next
    })
  }, [])

  const addRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 10)
      store('tt-recent', next)
      return next
    })
  }, [])
  const clearRecent = useCallback(() => {
    setRecent([])
    store('tt-recent', [])
  }, [])

  const value = useMemo(
    () => ({ lang, setLang, t: STRINGS[lang], saved, toggleSaved, recent, addRecent, clearRecent }),
    [lang, setLang, saved, toggleSaved, recent, addRecent, clearRecent],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside AppProvider')
  return v
}
