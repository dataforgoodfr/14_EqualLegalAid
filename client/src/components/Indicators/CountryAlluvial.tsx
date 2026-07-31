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
  '#093266', '#1E6FA5', '#3F9FD8', '#6BB8E8',
  '#D15F36', '#E1977C', '#7C3AED', '#059669',
]
const OTHER_COLOR = '#CBD3DE'
// Clé interne du regroupement, distincte de son libellé affiché : ce dernier porte
// le nombre de pays écartés, qui change à chaque masquage. Une entrée de `hidden`
// indexée sur le libellé deviendrait donc caduque au clic suivant.
const OTHER_KEY = '\u0000other'

// Repères du dessin, en unités du viewBox.
const W = 1000
const H = 470
const M = { top: 16, right: 24, bottom: 34, left: 150 }
const BAR_W = 40
const SEG_GAP = 2
// Interligne minimal entre deux libellés de pays, en unités du viewBox — au niveau
// de la taille de police (11) plus un filet d'air.
const LABEL_MIN_GAP = 13

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
    // Masqué, le regroupement quitte la légende comme le ferait un pays — il ne
    // reste visible que dans la liste des exclus, d'où on le réactive.
    const order = hidden.has(OTHER_KEY) ? [...top] : [...top, OTHER_KEY]
    const colorOf = (c: string) =>
      c === OTHER_KEY ? OTHER_COLOR : PALETTE[top.indexOf(c) % PALETTE.length]
    const labelOf = (c: string) => (c === OTHER_KEY ? otherLabel : c)

    const totals = years.map((year) => {
      const y = perYear.get(year)!
      let other = 0
      for (const [c, v] of y) if (!top.includes(c) && !hidden.has(c)) other += v
      const values = new Map<string, number>()
      for (const c of top) if (y.get(c)) values.set(c, y.get(c)!)
      if (other > 0 && !hidden.has(OTHER_KEY)) values.set(OTHER_KEY, other)
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

    // Décollage des libellés de la première colonne. Les petits pays ont des
    // segments de quelques pixels : posés à leur centre exact, les textes se
    // chevauchent. On écarte donc les libellés seuls, sans toucher aux segments —
    // élargir SEG_GAP fausserait la lecture des volumes, puisque les écarts sont
    // pris sur la hauteur de la pile.
    const labels = (columns[0]?.segments ?? []).map(s => ({
      country: s.country,
      anchorY: s.y + s.h / 2,
      y: s.y + s.h / 2,
    }))
    // Passe descendante, puis remontée si la pile déborde du bas.
    for (let i = 1; i < labels.length; i++) {
      const gap = labels[i].y - labels[i - 1].y
      if (gap < LABEL_MIN_GAP) labels[i].y = labels[i - 1].y + LABEL_MIN_GAP
    }
    const floor = H - M.bottom - 4
    if (labels.length && labels[labels.length - 1].y > floor) {
      labels[labels.length - 1].y = floor
      for (let i = labels.length - 2; i >= 0; i--) {
        const gap = labels[i + 1].y - labels[i].y
        if (gap < LABEL_MIN_GAP) labels[i].y = labels[i + 1].y - LABEL_MIN_GAP
      }
    }

    return { years, order, colorOf, labelOf, columns, otherLabel, groupedCount, labels }
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
                <title>{`${model.labelOf(seg.country)} — ${col.year} : ${seg.value.toLocaleString('fr-FR')}`}</title>
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
            {/* Libellés de pays sur la première colonne uniquement. Quand un libellé
                a dû être écarté de son segment, un filet de rappel le raccroche —
                sinon rien n'indique à quelle bande il se rapporte. */}
            {i === 0 && model.labels.map((lbl) => {
              const moved = Math.abs(lbl.y - lbl.anchorY) > 1.5
              return (
                <g
                  key={`lbl-${lbl.country}`}
                  onMouseEnter={() => setActive(lbl.country)}
                  onClick={() => toggle(lbl.country)}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{t('statistics.clickToExclude')}</title>
                  {moved && (
                    <path
                      d={`M${col.x - 9},${lbl.y} H${col.x - 6} L${col.x - 2},${lbl.anchorY}`}
                      fill="none"
                      stroke={dim(lbl.country) ? '#CBD3DE' : model.colorOf(lbl.country)}
                      strokeWidth={0.8}
                      strokeOpacity={dim(lbl.country) ? 0.35 : 0.65}
                    />
                  )}
                  <text
                    x={col.x - 13}
                    y={lbl.y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={11}
                    fontWeight={dim(lbl.country) ? 400 : 600}
                    fill={dim(lbl.country) ? '#B7C2D4' : '#334155'}
                  >
                    {model.labelOf(lbl.country)}
                  </text>
                </g>
              )
            })}
          </g>
        ))}
      </svg>

      {/* Légende cliquable au survol — les segments les plus fins sont trop petits
          pour être visés à la souris. Les libellés de gauche portent le même clic. */}
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
              {model.labelOf(country)}
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
              {model.labelOf(c)}
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
