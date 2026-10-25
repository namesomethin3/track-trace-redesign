import { useCallback, useEffect, useRef, useState } from 'react'

/** Short feedback ("Saved", "Link copied") that fades on its own. */
export function useToast() {
  const [msg, setMsg] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const show = useCallback((m: string) => {
    window.clearTimeout(timer.current)
    setMsg(m)
    timer.current = window.setTimeout(() => setMsg(''), m.length > 40 ? 6000 : 2500)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return { msg, show }
}

export function Toast({ msg }: { msg: string }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      {msg && (
        <p className="pointer-events-auto max-w-md rounded-lg bg-ink px-4 py-2.5 text-[0.875rem] break-words text-white shadow-lg">
          {msg}
        </p>
      )}
    </div>
  )
}
