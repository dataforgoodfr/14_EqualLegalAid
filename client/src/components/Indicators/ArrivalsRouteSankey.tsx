import { useEffect, useMemo, useRef, useState } from 'react'
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import type { ArrivalsGreeceRecord } from '@/hooks/useArrivalsGreece'
import { SankeyNode, SankeyLink, SANKEY_MARGIN, midShiftFor } from './SankeyParts'

/**
 * Arrivées par voie d'entrée, en Sankey : points d'entrée → route → Grèce.
 *
 * Les trois routes se reconstituent exactement dans `v2_ind3_arrivals_greece` —
 * Eastern Aegean + Crete = `total_arrivals_sea`, Evros = `total_arrivals_land`,
 * et leur somme = `total_arrivals`. C'est cette conservation qui rend le diagramme
 * honnête : aucun flux n'est perdu ni inventé en chemin.
 */

const GREECE_COLOR = '#04356C'

// Rampe bleue commune aux autres graphiques du projet. Les îles reçoivent des
// crans successifs : le faisceau égéen se lit alors comme une famille.
const AEGEAN_ISLANDS: { key: keyof ArrivalsGreeceRecord, label: string, color: string }[] = [
  { key: 'lesvos', label: 'Lesvos', color: '#04356C' },
  { key: 'samos', label: 'Samos', color: '#1E6FA5' },
  { key: 'kos', label: 'Kos', color: '#3F9FD8' },
  { key: 'chios', label: 'Chios', color: '#6BB8E8' },
  { key: 'leros', label: 'Leros', color: '#9AD0F2' },
  { key: 'other_islands', label: 'Other islands', color: '#C5E5F8' },
]

const AEGEAN_COLOR = '#1E6FA5'
const CRETE_COLOR = '#6BB8E8'
const EVROS_COLOR = '#04356C'

export function ArrivalsRouteSankey({ records }: { records: ArrivalsGreeceRecord[] }) {
  const { t } = useTranslation()
  const [levels, setLevels] = useState<1 | 2>(2)
  const [year, setYear] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [wrapW, setWrapW] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWrapW(el.clientWidth))
    ro.observe(el)
    setWrapW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const years = useMemo(
    () => [...new Set(records.filter(r => r.total_arrivals > 0).map(r => r.year))].sort((a, b) => a - b),
    [records],
  )

  const totals = useMemo(() => {
    const acc = { crete: 0, evros: 0, islands: new Map<string, number>() }
    for (const r of records) {
      if (year !== null && r.year !== year) continue
      acc.crete += r.crete
      acc.evros += r.evros
      for (const i of AEGEAN_ISLANDS) {
        acc.islands.set(i.label, (acc.islands.get(i.label) ?? 0) + (r[i.key] as number))
      }
    }
    return acc
  }, [records, year])

  const data = useMemo(() => {
    const aegeanTotal = [...totals.islands.values()].reduce((s, v) => s + v, 0)
    const routes = [
      { name: t('statistics.routeEasternAegean'), value: aegeanTotal, color: AEGEAN_COLOR },
      { name: t('statistics.routeCrete'), value: totals.crete, color: CRETE_COLOR },
      { name: t('statistics.routeEvros'), value: totals.evros, color: EVROS_COLOR },
    ].filter(r => r.value > 0)

    const links: { source: number, target: number, value: number }[] = []

    // Un seul niveau : les trois routes rejoignent directement la Grèce.
    if (levels === 1) {
      const greeceIdx = routes.length
      routes.forEach((r, i) => links.push({ source: i, target: greeceIdx, value: r.value }))
      return {
        nodes: [
          ...routes.map(r => ({ name: r.name, nodeColor: r.color })),
          { name: t('statistics.greece'), nodeColor: GREECE_COLOR },
        ],
        links,
        sourceCount: routes.length,
        maxDepth: 1,
      }
    }

    // Deux niveaux. Crete et Evros sont à la fois point d'entrée et route : ils
    // traversent le niveau intermédiaire tels quels plutôt que d'être raccordés
    // directement à la Grèce, ce qui les placerait sur une colonne à part.
    const sources = [
      ...AEGEAN_ISLANDS
        .map(i => ({ name: i.label, color: i.color, value: totals.islands.get(i.label) ?? 0, route: 0 }))
        .filter(s => s.value > 0),
      { name: t('statistics.routeCrete'), color: CRETE_COLOR, value: totals.crete, route: 1 },
      { name: t('statistics.routeEvros'), color: EVROS_COLOR, value: totals.evros, route: 2 },
    ].filter(s => s.value > 0)

    const routeIdxOf = new Map<number, number>()
    routes.forEach((r, i) => {
      const original = r.name === t('statistics.routeEasternAegean') ? 0 : r.name === t('statistics.routeCrete') ? 1 : 2
      routeIdxOf.set(original, sources.length + i)
    })
    const greeceIdx = sources.length + routes.length

    sources.forEach((s, i) => {
      const target = routeIdxOf.get(s.route)
      if (target !== undefined) links.push({ source: i, target, value: s.value })
    })
    routes.forEach((r, i) => links.push({ source: sources.length + i, target: greeceIdx, value: r.value }))

    return {
      nodes: [
        ...sources.map(s => ({ name: s.name, nodeColor: s.color })),
        ...routes.map(r => ({ name: r.name, nodeColor: r.color })),
        { name: t('statistics.greece'), nodeColor: GREECE_COLOR },
      ],
      links,
      sourceCount: sources.length,
      maxDepth: 2,
    }
  }, [totals, levels, t])

  if (!data.links.length) {
    return <p className="text-muted-foreground p-6 text-sm">{t('statistics.noData')}</p>
  }

  const height = Math.max(400, data.sourceCount * 46 + 60)
  const midShift = midShiftFor(wrapW, data.maxDepth)

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
        <div className="border-border flex items-center overflow-hidden rounded-md border">
          <button
            type="button"
            onClick={() => setLevels(1)}
            className={`px-2.5 py-1.5 text-xs ${levels === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t('statistics.flowOneLevel')}
          </button>
          <button
            type="button"
            onClick={() => setLevels(2)}
            className={`border-border border-l px-2.5 py-1.5 text-xs ${levels === 2 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t('statistics.flowTwoLevels')}
          </button>
        </div>
        <select
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm"
          value={year ?? 'all'}
          onChange={e => setYear(e.target.value === 'all' ? null : Number(e.target.value))}
        >
          <option value="all">{t('statistics.allYears')}</option>
          {[...years].reverse().map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div ref={wrapRef} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={data}
            nodePadding={26}
            nodeWidth={12}
            margin={SANKEY_MARGIN}
            link={<SankeyLink maxDepth={data.maxDepth} midShift={midShift} />}
            node={<SankeyNode maxDepth={data.maxDepth} midShift={midShift} />}
          >
            <Tooltip formatter={(value: unknown) => Number(value).toLocaleString('fr-FR')} />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
