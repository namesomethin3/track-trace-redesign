// Office names stay exactly as India Post writes them. This only adds a plain meaning beside
// them. The meanings are general India Post terminology, not research findings.

export type TermKey = 'SO' | 'HO' | 'BO' | 'PH' | 'TMO' | 'TC'

export interface ParsedOffice {
  name: string
  city: string
  term?: TermKey
}

const SUFFIXES: [string, TermKey][] = [
  [' S.O', 'SO'],
  [' H.O', 'HO'],
  [' B.O', 'BO'],
  [' PH', 'PH'],
  [' TMO', 'TMO'],
  [' Transshipment Centre', 'TC'],
]

export function parseOffice(name: string): ParsedOffice {
  const prefix = 'Transshipment Centre '
  if (name.startsWith(prefix)) return { name, city: name.slice(prefix.length), term: 'TC' }
  for (const [suffix, term] of SUFFIXES) {
    if (name.endsWith(suffix)) return { name, city: name.slice(0, -suffix.length), term }
  }
  return { name, city: name }
}

export const cityOf = (office: string) => parseOffice(office).city
