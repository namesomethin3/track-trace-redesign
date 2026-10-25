import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const WIDTH = 256
const EDGE = 12

/**
 * A small popover that opens on hover, tap or keyboard focus. It is fixed-positioned and clamped
 * to the screen, so it sits on top of the content and never shifts or widens the layout.
 * Escape, moving away or scrolling closes it.
 */
export function Tip({
  trigger,
  tip,
  label,
  plain = false,
}: {
  trigger: ReactNode
  tip: ReactNode
  label?: string
  /** No dotted underline, e.g. for an icon trigger. */
  plain?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<CSSProperties>({})
  const id = useId()
  const btn = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (!open || !btn.current) return
    const r = btn.current.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const width = Math.min(WIDTH, vw - EDGE * 2)
    const left = Math.max(EDGE, Math.min(r.left, vw - EDGE - width))
    setStyle({ top: r.bottom + 6, left, width })
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, { passive: true })
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close)
      window.removeEventListener('resize', close)
    }
  }, [open])

  return (
    <span className="inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        ref={btn}
        type="button"
        aria-describedby={id}
        aria-label={label}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className={`cursor-help rounded ${
          plain ? 'inline-flex align-middle text-muted hover:text-ink' : 'underline decoration-dotted decoration-from-font underline-offset-4'
        }`}
      >
        {trigger}
      </button>
      <span
        id={id}
        role="tooltip"
        hidden={!open}
        style={style}
        className="fixed z-40 rounded-md bg-ink px-3 py-2 text-left text-[0.875rem] leading-snug font-normal text-white shadow-lg"
      >
        {tip}
      </span>
    </span>
  )
}
