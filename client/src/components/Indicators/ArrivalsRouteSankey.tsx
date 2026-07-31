import { useEffect, useMemo, useRef, useState } from 'react'
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import type { ArrivalsGreeceRecord } from '@/hooks/useArrivalsGreece'
import { SankeyNode, SankeyLink, SANKEY_MARGIN, midShiftFor } from './SankeyParts'
import { ENTRY_COLORS, SEA_COLOR, LAND_COLOR, GREECE_COLOR } from './arrivalsColors'

/**
 * Arrivées par voie d'entrée, en Sankey : points d'entrée → route → Grèce.
 *
 * Les trois routes se reconstituent exactement dans `v2_ind3_arrivals_greece` —
 * Eastern Aegean + Crete = `total_arrivals_sea`, Evros = `total_arrivals_land`,
 * et leur somme = `total_arrivals`. C'est cette conservation qui rend le diagramme
 * honnête : aucun flux n'est perdu ni inventé en chemin.
 */

// Couleurs reprises telles quelles de la carte au-dessus, via la source commune :
// une même île doit garder sa teinte d'une représentation à l'autre.
const AEGEAN_ISLANDS: { key: keyof ArrivalsGreeceRecord, label: string, color: string }[] = [
  { key: 'lesvos', label: 'Lesvos', color: ENTRY_COLORS.lesvos },
  { key: 'samos', label: 'Samos', color: ENTRY_COLORS.samos },
  { key: 'kos', label: 'Kos', color: ENTRY_COLORS.kos },
  { key: 'chios', label: 'Chios', color: ENTRY_COLORS.chios },
  { key: 'leros', label: 'Leros', color: ENTRY_COLORS.leros },
  { key: 'other_islands', label: 'Other islands', color: ENTRY_COLORS.other_islands },
]

const AEGEAN_COLOR = SEA_COLOR
const CRETE_COLOR = ENTRY_COLORS.crete
const EVROS_COLOR = ENTRY_COLORS.evros

/** Noms des trois routes dans l'ordre : Eastern Aegean, Crete, Evros. */
const ROUTE_NAMES = (t: (k: string) => string) => [
  t('statistics.routeEasternAegean'),
  t('statistics.routeCrete'),
  t('statistics.routeEvros'),
]

export function ArrivalsRouteSankey({ records }: { records: ArrivalsGreeceRecord[] }) {
  const { t } = useTranslation()
  const [levels, setLevels] = useState<1 | 2 | 3>(2)
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

    // Deux niveaux ou plus. Crete et Evros sont à la fois point d'entrée et route :
    // ils traversent le niveau intermédiaire tels quels plutôt que d'être raccordés
    // directement à la Grèce, ce qui les placerait sur une colonne à part.
    // `route` : 0 = Eastern Aegean, 1 = Crete, 2 = Evros.
    const sources = [
      ...AEGEAN_ISLANDS
        .map(i => ({ name: i.label, color: i.color, value: totals.islands.get(i.label) ?? 0, route: 0 }))
        .filter(s => s.value > 0),
      { name: t('statistics.routeCrete'), color: CRETE_COLOR, value: totals.crete, route: 1 },
      { name: t('statistics.routeEvros'), color: EVROS_COLOR, value: totals.evros, route: 2 },
    ].filter(s => s.value > 0)

    // Les routes conservent leur rang d'origine, sinon le raccordement se perd dès
    // qu'une route est vide sur l'année choisie.
    const routeRank = [0, 1, 2].filter(r => routes.some(x => x.name === ROUTE_NAMES(t)[r]))
    const routeIdxOf = new Map(routeRank.map((r, i) => [r, sources.length + i]))
    sources.forEach((s, i) => {
      const target = routeIdxOf.get(s.route)
      if (target !== undefined) links.push({ source: i, target, value: s.value })
    })

    const routeNodes = routes.map(r => ({ name: r.name, nodeColor: r.color }))

    if (levels === 2) {
      const greeceIdx = sources.length + routes.length
      routes.forEach((r, i) => links.push({ source: sources.length + i, target: greeceIdx, value: r.value }))
      return {
        nodes: [...sources.map(s => ({ name: s.name, nodeColor: s.color })), ...routeNodes,
          { name: t('statistics.greece'), nodeColor: GREECE_COLOR }],
        links,
        sourceCount: sources.length,
        maxDepth: 2,
      }
    }

    // Trois niveaux : les routes se regroupent en voie d'entrée avant la Grèce.
    // Eastern Aegean + Crete reconstituent `total_arrivals_sea`, Evros à lui seul
    // `total_arrivals_land` — le regroupement est exact, pas approché.
    const seaTotal = routes.filter(r => r.name !== ROUTE_NAMES(t)[2]).reduce((s, r) => s + r.value, 0)
    const landTotal = routes.filter(r => r.name === ROUTE_NAMES(t)[2]).reduce((s, r) => s + r.value, 0)
    const modes = [
      { name: t('statistics.seaArrivals'), value: seaTotal, color: SEA_COLOR },
      { name: t('statistics.landArrivals'), value: landTotal, color: LAND_COLOR },
    ].filter(m => m.value > 0)

    const modeBase = sources.length + routes.length
    const modeIdxOf = new Map<'sea' | 'land', number>()
    modes.forEach((m, i) => modeIdxOf.set(m.name === t('statistics.landArrivals') ? 'land' : 'sea', modeBase + i))
    const greeceIdx = modeBase + modes.length

    routes.forEach((r, i) => {
      const target = modeIdxOf.get(r.name === ROUTE_NAMES(t)[2] ? 'land' : 'sea')
      if (target !== undefined) links.push({ source: sources.length + i, target, value: r.value })
    })
    modes.forEach((m, i) => links.push({ source: modeBase + i, target: greeceIdx, value: m.value }))

    return {
      nodes: [
        ...sources.map(s => ({ name: s.name, nodeColor: s.color })),
        ...routeNodes,
        ...modes.map(m => ({ name: m.name, nodeColor: m.color })),
        { name: t('statistics.greece'), nodeColor: GREECE_COLOR },
      ],
      links,
      sourceCount: sources.length,
      maxDepth: 3,
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
          {([1, 2, 3] as const).map((n, i) => (
            <button
              key={n}
              type="button"
              onClick={() => setLevels(n)}
              className={`px-2.5 py-1.5 text-xs whitespace-nowrap ${i > 0 ? 'border-border border-l' : ''} ${levels === n ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
            >
              {t(n === 1 ? 'statistics.flowOneLevel' : n === 2 ? 'statistics.flowTwoLevels' : 'statistics.flowThreeLevels')}
            </button>
          ))}
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
