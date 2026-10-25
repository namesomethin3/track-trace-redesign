const PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  info: 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 100-18 9 9 0 000 18z',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  link: 'M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1',
  bookmark: 'M6 4h12v17l-6-4-6 4z',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  box: 'M3 7.5L12 3l9 4.5v9L12 21l-9-4.5zM3 7.5L12 12l9-4.5M12 12v9',
  chat: 'M4 5h16v11H8l-4 4z',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  chevron: 'M9 6l6 6-6 6',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4',
  refresh: 'M4 4v6h6M20 20v-6h-6M18.4 9A7 7 0 006.3 6.3L4 10M5.6 15a7 7 0 0012.1 2.7L20 14',
  volume: 'M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13',
  globe:'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.7 3.5 5.7 3.5 9s-1 6.3-3.5 9c-2.5-2.7-3.5-5.7-3.5-9s1-6.3 3.5-9z',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const size = /\bh-/.test(className) ? '' : 'h-5 w-5'
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${size} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
