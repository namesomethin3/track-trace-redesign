import { parseOffice, type TermKey } from '../lib/places'
import { useApp } from '../state'
import { Tip } from './Tip'

/** Terms written as abbreviations; only these get a tooltip. */
export const ABBR: Partial<Record<TermKey, string>> = { SO: 'S.O', HO: 'H.O', BO: 'B.O', PH: 'PH', TMO: 'TMO' }

/**
 * The official name exactly as India Post writes it. The abbreviation (S.O, PH, TMO…) has a
 * dotted underline that opens a short explanation.
 */
export function OfficeName({ name }: { name: string }) {
  const { t } = useApp()
  const { term } = parseOffice(name)
  const abbr = term && ABBR[term]
  if (!term || !abbr || !name.endsWith(` ${abbr}`)) return <>{name}</>
  return (
    <>
      {name.slice(0, -abbr.length)}
      <Tip trigger={abbr} tip={t.explain[term]} />
    </>
  )
}
