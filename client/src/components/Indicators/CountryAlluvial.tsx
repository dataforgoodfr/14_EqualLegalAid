import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AsylumApplicationByNationalityRecord } from '@/hooks/useGreeceTotalApplications'

/**
 * Diagramme alluvial : une colonne empilée par année, reliée à la suivante par des
 * rubans. Recharts n'a pas ce type de graphique, il est dessiné en SVG.
 *
 * ATTENTION à la lecture : un ruban relie un même pays d'une année à l'autre. Il ne
 * représente PAS des personnes passant d'une catégorie à une autre — c'est la
 * grammaire habituelle des alluviaux temporels, mais elle se mésinterprète vite.
 */

const PALETTE = [
  '#003366', '#1E6FA5', '#3F9FD8', '#6BB8E8',
  '#D15F36', '#E1977C', '#7C3AED', '#059669',
]
const OTHER_COLOR = '#CBD3DE'

// Repères du dessin, en unités du viewBox.
const W = 1000
const H = 470
const M = { top: 16, right: 24, bottom: 34, left: 150 }
const BAR_W = 40
const SEG_GAP = 2

interface Segment {
  country: string
  value: number
  y: number
  h: number
}

export function CountryAlluvial({
  records,
  topN,
}: {
  records: AsylumApplicationByNationalityRecord[]
  /** 0 = tous les pays détaillés, sans regroupement. */
  topN: number
}) {
  const { t } = useTranslation()
  const [active, setActive] = useState<string | null>(null)
  // Pays retirés de la pile. Seul moyen d'agrandir les petites séries : l'échelle
  // suit le total de la colonne, une échelle log étant exclue par l'empilement
  // (des hauteurs logarithmiques ne s'additionnent pas).
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const toggle = (c: string) => setHidden((prev) => {
    const next = new Set(prev)
    next.has(c) ? next.delete(c) : next.add(c)
    return next
  })

  const model = useMemo(() => {
    const perYear = new Map<number, Map<string, number>>()
    const grand = new Map<string, number>()
    for (const r of records) {
      const country = r.country
      if (!country || !r.year) continue
      if (!perYear.has(r.year)) perYear.set(r.year, new Map())
      const y = perYear.get(r.year)!
      y.set(country, (y.get(country) ?? 0) + r.total_applications)
      grand.set(country, (grand.get(country) ?? 0) + r.total_applications)
    }
    const years = Array.from(perYear.keys()).sort((a, b) => a - b)
    const ranked = Array.from(grand.entries()).sort((a, b) => b[1] - a[1])
    const top = (topN > 0 ? ranked.slice(0, topN) : ranked).map(([c]) => c).filter(c => !hidden.has(c))
    const groupedCount = ranked.length - top.length
    // Le nombre de pays regroupés est affiché : sans lui, la bande grise masque
    // combien d'origines ont été écartées, ce qui n'est pas neutre.
    const otherLabel = groupedCount > 0
      ? `${t('statistics.otherCountries')} (${groupedCount})`
      : t('statistics.otherCountries')

    // Ordre de pile identique dans toutes les colonnes, du plus gros au plus petit
    // sur l'ensemble de la période : c'est ce qui empêche les rubans de se croiser.
    const order = [...top, otherLabel]
    const colorOf = (c: string) =>
      c === otherLabel ? OTHER_COLOR : PALETTE[top.indexOf(c) % PALETTE.length]

    const totals = years.map((year) => {
      const y = perYear.get(year)!
      let other = 0
      for (const [c, v] of y) if (!top.includes(c) && !hidden.has(c)) other += v
      const values = new Map<string, number>()
      for (const c of top) if (y.get(c)) values.set(c, y.get(c)!)
      if (other > 0) values.set(otherLabel, other)
      return { year, values, total: Array.from(values.values()).reduce((a, b) => a + b, 0) }
    })

    const maxTotal = Math.max(...totals.map(c => c.total), 1)
    const plotW = W - M.left - M.right
    const plotH = H - M.top - M.bottom

    // Hauteurs absolues et non normalisées : le volume total passe de 15 627 à
    // 61 112 entre 2022 et 2024, l'écraser masquerait l'essentiel.
    const columns = totals.map((col, i) => {
      const x = M.left + (years.length > 1 ? (i * (plotW - BAR_W)) / (years.length - 1) : 0)
      const scale = plotH / maxTotal
      const present = order.filter(c => col.values.has(c))
      const totalGaps = Math.max(present.length - 1, 0) * SEG_GAP
      let cursor = M.top + plotH - col.total * scale - totalGaps
      const segments: Segment[] = []
      for (const country of present) {
        const value = col.values.get(country)!
        const h = Math.max(value * scale, 1)
        segments.push({ country, value, y: cursor, h })
        cursor += h + SEG_GAP
      }
      return { ...col, x, segments }
    })

    return { years, order, colorOf, columns, otherLabel, groupedCount }
  }, [records, topN, hidden, t])

  if (!model.columns.length) {
    return <p className="text-muted-foreground p-6 text-sm">{t('statistics.noData')}</p>
  }

  const segAt = (colIndex: number, country: string) =>
    model.columns[colIndex].segments.find(s => s.country === country)

  const dim = (country: string) => active !== null && active !== country

  return (
    <div onMouseLeave={() => setActive(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto' }} role="img">
        {/* Rubans entre colonnes consécutives, dessinés avant les barres pour
            passer dessous. Courbes de Bézier horizontales, sans croisement puisque
            l'ordre de pile est constant. */}
        {model.columns.slice(0, -1).map((col, i) => {
          const next = model.columns[i + 1]
          return model.order.map((country) => {
            const a = segAt(i, country)
            const b = segAt(i + 1, country)
            if (!a || !b) return null
            const x1 = col.x + BAR_W
            const x2 = next.x
            const cx = (x1 + x2) / 2
            const d = [
              `M${x1},${a.y}`,
              `C${cx},${a.y} ${cx},${b.y} ${x2},${b.y}`,
              `L${x2},${b.y + b.h}`,
              `C${cx},${b.y + b.h} ${cx},${a.y + a.h} ${x1},${a.y + a.h}`,
              'Z',
            ].join(' ')
            return (
              <path
                key={`${i}-${country}`}
                d={d}
                fill={model.colorOf(country)}
                fillOpacity={dim(country) ? 0.06 : 0.28}
                style={{ transition: 'fill-opacity .15s' }}
              />
            )
          })
        })}

        {/* Barres empilées */}
        {model.columns.map((col, i) => (
          <g key={col.year}>
            {col.segments.map(seg => (
              <rect
                key={seg.country}
                x={col.x}
                y={seg.y}
                width={BAR_W}
                height={seg.h}
                rx={2}
                fill={model.colorOf(seg.country)}
                fillOpacity={dim(seg.country) ? 0.2 : 1}
                onMouseEnter={() => setActive(seg.country)}
                style={{ cursor: 'pointer', transition: 'fill-opacity .15s' }}
              >
                <title>{`${seg.country} — ${col.year} : ${seg.value.toLocaleString('fr-FR')}`}</title>
              </rect>
            ))}
            <text
              x={col.x + BAR_W / 2}
              y={H - 12}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill="#5A6472"
            >
              {col.year}
            </text>
            {/* Total de l'année, au-dessus de la pile */}
            <text
              x={col.x + BAR_W / 2}
              y={Math.min(...col.segments.map(s => s.y)) - 6}
              textAnchor="middle"
              fontSize={11}
              fill="#8B94A1"
            >
              {col.total.toLocaleString('fr-FR')}
            </text>
            {/* Libellés de pays sur la première colonne uniquement */}
            {i === 0 && col.segments.map(seg => (
              <text
                key={`lbl-${seg.country}`}
                x={col.x - 10}
                y={seg.y + seg.h / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={dim(seg.country) ? 400 : 600}
                fill={dim(seg.country) ? '#B7C2D4' : '#334155'}
                onMouseEnter={() => setActive(seg.country)}
                style={{ cursor: 'pointer' }}
              >
                {seg.country}
              </text>
            ))}
          </g>
        ))}
      </svg>

      {/* Légende cliquable au survol — les segments les plus fins sont trop petits
          pour être visés à la souris. */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {model.order.map(country => (
          <button
            key={country}
            type="button"
            onMouseEnter={() => setActive(country)}
            onFocus={() => setActive(country)}
            onClick={() => toggle(country)}
            title={t('statistics.clickToExclude')}
            className={`flex items-center gap-1.5 text-xs transition-opacity ${dim(country) ? 'opacity-30' : ''}`}
          >
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: model.colorOf(country) }}
            />
            <span className={active === country ? 'font-semibold text-gray-900' : 'text-gray-600'}>
              {country}
            </span>
          </button>
        ))}
      </div>

      {hidden.size > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-muted-foreground text-xs">{t('statistics.excluded')}</span>
          {Array.from(hidden).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 line-through hover:bg-gray-200"
            >
              {c}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setHidden(new Set())}
            className="text-xs underline"
            style={{ color: '#D15F36' }}
          >
            {t('statistics.resetFilters')}
          </button>
        </div>
      )}

      <p className="text-muted-foreground mt-3 text-xs">
        {t('statistics.alluvialNote')}
      </p>
    </div>
  )
}
