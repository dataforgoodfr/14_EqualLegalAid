import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import maplibregl from 'maplibre-gl'
import grUrl from '@/assets/gr.json?url'
import layersFn from 'protomaps-themes-base'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Sankey, ResponsiveContainer,
} from 'recharts'
import { CHART_GRID_PROPS } from '@/components/ui'
import type { AsylumApplicationByNationalityRecord } from '@/hooks/useGreeceTotalApplications'
import { useTranslation } from 'react-i18next'

const PROTOMAP_KEY = import.meta.env.VITE_PROTOMAP_KEY as string

const ISLANDS_COLOR = '#1E6FA5'
const MAINLAND_COLOR = '#D97706'
// Bleu primaire de la charte. La Grèce est un aplat de pays, pas une bulle : la
// forme suffit à la distinguer des origines, pas besoin d'une couleur d'accent.
const GREECE_COLOR = '#04356C'

const COUNTRY_PALETTE = [
  '#04356C', '#1E6FA5', '#3F9FD8', '#6BB8E8', '#7C3AED',
  '#A78BFA', '#B45309', '#059669', '#94a3b8',
]

// TODO retirer après correction d'Airtable : « Palestina » et « other » sont des
// doublons de saisie de « Palestine » et « Other » dans le singleSelect `country`.
// Sans cette fusion la Palestine perd 2 832 demandes et apparaît deux fois.
const COUNTRY_FIX: Record<string, string> = {
  Palestina: 'Palestine',
  other: 'Other',
}

// Centroïdes approximatifs, en [lng, lat] comme l'attend MapLibre. Écrits ici
// plutôt que calculés depuis countries.geojson : ce fichier pèse 14 Mo et n'est
// chargé que par l'onglet EU — l'importer ici pour 38 points serait disproportionné.
// `Stateless` et `Other` sont volontairement absents : ils n'ont pas de géographie.
const COUNTRY_COORDS: Record<string, [number, number]> = {
  'Syria': [38.0, 35.0],
  'Afghanistan': [67.7, 33.9],
  'Egypt': [30.8, 26.8],
  'Palestine': [35.2, 31.9],
  'Sudan': [30.2, 15.5],
  'Iraq': [43.7, 33.2],
  'Turkey': [35.2, 39.0],
  'Somalia': [46.2, 5.2],
  'Yemen': [48.5, 15.6],
  'Eritrea': [39.8, 15.2],
  'Bangladesh': [90.4, 23.7],
  'Sierra Leone': [-11.8, 8.5],
  'Ethiopia': [40.5, 9.1],
  'Iran': [53.7, 32.4],
  'Nepal': [84.1, 28.4],
  'DRC': [23.6, -2.9],
  'Cameroon': [12.4, 7.4],
  'Pakistan': [69.3, 30.4],
  'Guinea': [-9.7, 9.9],
  'South Sudan': [31.3, 6.9],
  'Morocco': [-7.1, 31.8],
  'China': [104.2, 35.9],
  'Senegal': [-14.5, 14.5],
  'Mali': [-4.0, 17.6],
  'Lebanon': [35.9, 33.9],
  'Congo': [15.8, -0.2],
  'Sri Lanka': [80.8, 7.9],
  'Gambia': [-15.3, 13.4],
  'India': [78.9, 20.6],
  'Albania': [20.2, 41.2],
  'Kuwait': [47.5, 29.3],
  'Algeria': [1.7, 28.0],
  'Uganda': [32.3, 1.4],
  'Comoros': [43.9, -11.9],
  'Djibouti': [42.6, 11.8],
  'Haiti': [-72.3, 19.0],
}

export interface CountryRow {
  country: string
  islands: number
  mainland: number
  total: number
}

/** Agrège par pays pour une année donnée (ou toutes années si `year` est null). */
function aggregate(
  records: AsylumApplicationByNationalityRecord[],
  year: number | null,
): CountryRow[] {
  const map = new Map<string, CountryRow>()
  for (const r of records) {
    if (year !== null && r.year !== year) continue
    const country = COUNTRY_FIX[r.country] ?? r.country
    if (!country) continue
    let row = map.get(country)
    if (!row) {
      row = { country, islands: 0, mainland: 0, total: 0 }
      map.set(country, row)
    }
    row.islands += r.islands_applications
    row.mainland += r.mainland_applications
    row.total += r.total_applications
  }
  return Array.from(map.values())
    .filter(r => r.total > 0)
    .sort((a, b) => b.total - a.total)
}

// ── Vue 1 : classement en barres horizontales, scindé îles / continent ─────────

export function CountryBars({ rows }: { rows: CountryRow[] }) {
  const { t } = useTranslation()
  if (!rows.length) return <p className="text-muted-foreground p-6 text-sm">{t('statistics.noData')}</p>

  // 26 px par pays : en dessous les libellés se chevauchent.
  const height = Math.max(rows.length * 26 + 60, 200)

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid {...CHART_GRID_PROPS} horizontal={false} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
          />
          <YAxis
            type="category"
            dataKey="country"
            width={110}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            formatter={(value, name) => [Number(value).toLocaleString('fr-FR'), name]}
          />
          <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="islands" stackId="loc" name={t('statistics.islandsApplications')} fill={ISLANDS_COLOR} />
          <Bar dataKey="mainland" stackId="loc" name={t('statistics.mainlandApplications')} fill={MAINLAND_COLOR} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Vue 2 : carte à bulles proportionnelles ───────────────────────────────────

// Rayon en racine carrée de la valeur : c'est l'AIRE du cercle qui doit être
// proportionnelle au volume, sinon l'écart est visuellement surinterprété.
const radiusExpression = (maxValue: number): any => [
  'interpolate',
  ['linear'],
  ['sqrt', ['get', 'value']],
  0, 3,
  Math.sqrt(Math.max(maxValue, 1)), 46,
]

function buildGeoJSON(rows: CountryRow[]) {
  return {
    type: 'FeatureCollection' as const,
    features: rows
      .filter(r => COUNTRY_COORDS[r.country])
      .map(r => ({
        type: 'Feature' as const,
        properties: { label: r.country, value: r.total, islands: r.islands, mainland: r.mainland },
        geometry: { type: 'Point' as const, coordinates: COUNTRY_COORDS[r.country] },
      })),
  }
}

// Point de convergence. Toutes les trajectoires y aboutissent.
const GREECE_CENTER: [number, number] = [23.7, 38.5]

/**
 * Orthodromie entre un pays et la Grèce — le plus court chemin réel sur la
 * sphère, échantillonné en segments. Remplace une courbure décorative arbitraire :
 * en projection globe le tracé épouse la planète, et en projection plane il donne
 * la courbe que tout atlas dessine pour une trajectoire longue distance.
 * Interpolation sphérique de deux vecteurs unitaires (slerp).
 */
function greatCircle(from: [number, number], to: [number, number], steps = 48) {
  const rad = Math.PI / 180
  const toVec = ([lng, lat]: [number, number]) => {
    const p = lat * rad
    const l = lng * rad
    return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)] as const
  }
  const a = toVec(from)
  const b = toVec(to)
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  const pts: [number, number][] = []
  if (omega < 1e-6) return [from, to]
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const s1 = Math.sin((1 - t) * omega) / Math.sin(omega)
    const s2 = Math.sin(t * omega) / Math.sin(omega)
    const x = s1 * a[0] + s2 * b[0]
    const y = s1 * a[1] + s2 * b[1]
    const z = s1 * a[2] + s2 * b[2]
    pts.push([Math.atan2(y, x) / rad, Math.atan2(z, Math.hypot(x, y)) / rad])
  }
  return pts
}

function buildArcsGeoJSON(rows: CountryRow[]) {
  return {
    type: 'FeatureCollection' as const,
    features: rows
      .filter(r => COUNTRY_COORDS[r.country])
      .map(r => ({
        type: 'Feature' as const,
        properties: { label: r.country, value: r.total },
        geometry: {
          type: 'LineString' as const,
          coordinates: greatCircle(COUNTRY_COORDS[r.country], GREECE_CENTER),
        },
      })),
  }
}

const arcWidthExpression = (maxValue: number): any => [
  'interpolate',
  ['linear'],
  ['sqrt', ['get', 'value']],
  0, 0.4,
  Math.sqrt(Math.max(maxValue, 1)), 5,
]

export function CountryBubbleMap({ rows }: { rows: CountryRow[] }) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const mapLoadedRef = useRef(false)
  const rowsRef = useRef<CountryRow[]>(rows)
  rowsRef.current = rows
  const [projection, setProjection] = useState<'globe' | 'mercator'>('globe')

  const unmapped = useMemo(
    () => rows.filter(r => !COUNTRY_COORDS[r.country]),
    [rows],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const style: any = {
      version: 8,
      glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
      sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v4/light',
      sources: {
        protomaps: {
          type: 'vector',
          tiles: [`https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.mvt?key=${PROTOMAP_KEY}`],
          maxzoom: 15,
          attribution: '© <a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
        },
      },
      layers: layersFn('protomaps', 'light', 'en'),
      // Projection globe : les orthodromies épousent alors réellement la sphère,
      // au lieu d'être aplaties par Mercator.
      projection: { type: 'globe' },
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [35, 22],
      zoom: 1.6,
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.on('error', e => console.error(e.error))

    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })

    map.on('load', () => {
      map.resize()
      const data = buildGeoJSON(rowsRef.current)
      const arcs = buildArcsGeoJSON(rowsRef.current)
      const maxValue = Math.max(...data.features.map(f => f.properties.value), 1)

      // Les arcs d'abord, la Grèce par-dessus : les tracés disparaissent ainsi sous
      // l'aplat du pays et se lisent comme aboutissant à la Grèce entière, non à un
      // point GPS arbitraire posé au milieu.
      map.addSource('arcs', { type: 'geojson', data: arcs as any })
      map.addLayer({
        id: 'arcs-line',
        type: 'line',
        source: 'arcs',
        layout: { 'line-cap': 'round' },
        paint: {
          'line-color': ISLANDS_COLOR,
          'line-opacity': 0.28,
          'line-width': arcWidthExpression(maxValue),
        },
      })

      map.addSource('greece', { type: 'geojson', data: grUrl })
      map.addLayer({
        id: 'greece-fill',
        type: 'fill',
        source: 'greece',
        paint: { 'fill-color': GREECE_COLOR, 'fill-opacity': 1 },
      })

      map.addSource('countries-bubbles', { type: 'geojson', data: data as any })
      map.addLayer({
        id: 'bubbles',
        type: 'circle',
        source: 'countries-bubbles',
        paint: {
          'circle-radius': radiusExpression(maxValue),
          'circle-color': ISLANDS_COLOR,
          'circle-opacity': 0.6,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      })

      map.on('mousemove', 'bubbles', (e) => {
        if (!e.features?.length) return
        map.getCanvas().style.cursor = 'pointer'
        const p = e.features[0].properties as { label: string, value: number, islands: number, mainland: number }
        popup.setHTML(`
          <div style="font-size:12px;font-weight:600;margin-bottom:4px">${p.label}</div>
          <div style="font-size:12px">${Number(p.value).toLocaleString('fr-FR')}</div>
          <div style="font-size:11px;color:#64748b">
            ${Number(p.islands).toLocaleString('fr-FR')} / ${Number(p.mainland).toLocaleString('fr-FR')}
          </div>
        `).setLngLat(e.lngLat).addTo(map)
      })
      map.on('mouseleave', 'bubbles', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
      })

      mapLoadedRef.current = true
    })

    return () => {
      mapLoadedRef.current = false
      popup.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return
    map.setProjection({ type: projection })
  }, [projection])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return
    const data = buildGeoJSON(rows)
    const maxValue = Math.max(...data.features.map(f => f.properties.value), 1)
    ;(map.getSource('countries-bubbles') as maplibregl.GeoJSONSource | undefined)?.setData(data as any)
    ;(map.getSource('arcs') as maplibregl.GeoJSONSource | undefined)?.setData(buildArcsGeoJSON(rows) as any)
    map.setPaintProperty('bubbles', 'circle-radius', radiusExpression(maxValue))
    map.setPaintProperty('arcs-line', 'line-width', arcWidthExpression(maxValue))
  }, [rows])

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <div className="border-border flex items-center overflow-hidden rounded-md border">
          <button
            type="button"
            onClick={() => setProjection('globe')}
            className={`px-2.5 py-1.5 text-xs ${projection === 'globe' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t('statistics.viewGlobe')}
          </button>
          <button
            type="button"
            onClick={() => setProjection('mercator')}
            className={`border-border border-l px-2.5 py-1.5 text-xs ${projection === 'mercator' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t('statistics.viewFlat')}
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200" style={{ height: 460 }}>
        <div ref={containerRef} className="h-full w-full" />
      </div>
      {unmapped.length > 0 && (
        // Ces catégories n'ont pas de coordonnées possibles — les taire donnerait
        // une carte dont le total ne correspond pas au classement.
        <p className="text-muted-foreground mt-2 text-xs">
          {t('statistics.notOnMap')}
          {' '}
          {unmapped.map(r => `${r.country} (${r.total.toLocaleString('fr-FR')})`).join(', ')}
        </p>
      )}
    </div>
  )
}

// ── Vue 3 : Sankey pays → route ───────────────────────────────────────────────

const SANKEY_TOP = 8

// Recharts ne dessine que des rectangles nus : sans nœud personnalisé, le
// diagramme n'a aucune étiquette. Les sources reçoivent leur libellé à gauche,
// les destinations à droite, d'où les marges latérales généreuses.
function SankeyNode(props: any) {
  const { x, y, width, height, payload } = props
  // `depth` plutôt qu'une comparaison à containerWidth : recharts ne transmet pas
  // toujours cette largeur au nœud personnalisé, et le libellé basculait à droite.
  const isSource = (payload?.depth ?? 0) === 0
  const color = payload.nodeColor ?? '#94a3b8'
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} rx={2} />
      <text
        x={isSource ? x - 8 : x + width + 8}
        y={y + height / 2}
        textAnchor={isSource ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize={11}
        fill="#334155"
      >
        {payload.name}
      </text>
      <text
        x={isSource ? x - 8 : x + width + 8}
        y={y + height / 2 + 13}
        textAnchor={isSource ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize={10}
        fill="#94a3b8"
      >
        {Number(payload.value ?? 0).toLocaleString('fr-FR')}
      </text>
    </g>
  )
}

// Ruban coloré d'après le pays d'origine, sinon les huit flux se confondent.
function SankeyLink(props: any) {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload } = props
  const color = payload?.source?.nodeColor ?? '#94a3b8'
  return (
    <path
      d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={color}
      strokeWidth={linkWidth}
      strokeOpacity={0.4}
    />
  )
}

export function CountrySankey({ rows }: { rows: CountryRow[] }) {
  const { t } = useTranslation()

  // Au-delà de 8 pays les rubans deviennent des filets d'un pixel, étiquettes
  // illisibles — le reste est regroupé, ce que le classement n'a pas à faire.
  const data = useMemo(() => {
    const top = rows.slice(0, SANKEY_TOP)
    const rest = rows.slice(SANKEY_TOP)
    const restRow: CountryRow = {
      country: t('statistics.otherCountries'),
      islands: rest.reduce((s, r) => s + r.islands, 0),
      mainland: rest.reduce((s, r) => s + r.mainland, 0),
      total: rest.reduce((s, r) => s + r.total, 0),
    }
    const sources = restRow.total > 0 ? [...top, restRow] : top
    const nodes = [
      ...sources.map((r, i) => ({ name: r.country, nodeColor: COUNTRY_PALETTE[i % COUNTRY_PALETTE.length] })),
      { name: t('statistics.seaArrivals'), nodeColor: ISLANDS_COLOR },
      { name: t('statistics.landArrivals'), nodeColor: MAINLAND_COLOR },
    ]
    const islandsIdx = sources.length
    const mainlandIdx = sources.length + 1
    const links: { source: number, target: number, value: number }[] = []
    sources.forEach((r, i) => {
      if (r.islands > 0) links.push({ source: i, target: islandsIdx, value: r.islands })
      if (r.mainland > 0) links.push({ source: i, target: mainlandIdx, value: r.mainland })
    })
    return { nodes, links }
  }, [rows, t])

  if (!rows.length || !data.links.length) {
    return <p className="text-muted-foreground p-6 text-sm">{t('statistics.noData')}</p>
  }

  return (
    <div style={{ height: 460 }}>
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          nodePadding={26}
          nodeWidth={12}
          margin={{ top: 12, right: 130, bottom: 12, left: 130 }}
          link={<SankeyLink />}
          node={<SankeyNode />}
        >
          <Tooltip formatter={(value: unknown) => Number(value).toLocaleString('fr-FR')} />
        </Sankey>
      </ResponsiveContainer>
    </div>
  )
}

// ── Sélecteur de vue ──────────────────────────────────────────────────────────

export type CountryView = 'bars' | 'map' | 'sankey' | 'lines'

export function CountryOfOriginViews({
  records,
  linesView,
}: {
  records: AsylumApplicationByNationalityRecord[]
  // La vue en courbes reste définie dans le composant parent : elle s'appuie sur
  // les utilitaires d'agrégation qui y vivent et sert aussi ailleurs.
  linesView?: ReactNode
}) {
  const { t } = useTranslation()
  const [view, setView] = useState<CountryView>('bars')
  const [year, setYear] = useState<number | null>(null)
  // 0 = tous. Le classement seul en tire parti : la carte et le Sankey ont déjà
  // leur propre façon de gérer la traîne des petits pays.
  const [topN, setTopN] = useState(10)

  const years = useMemo(
    () => Array.from(new Set(records.map(r => r.year).filter(Boolean))).sort((a, b) => a - b),
    [records],
  )
  const rows = useMemo(() => aggregate(records, year), [records, year])

  const tabs: { key: CountryView, label: string }[] = [
    { key: 'bars', label: t('statistics.viewRanking') },
    { key: 'map', label: t('statistics.viewMap') },
    { key: 'sankey', label: t('statistics.viewFlow') },
    ...(linesView ? [{ key: 'lines' as CountryView, label: t('statistics.viewLines') }] : []),
  ]

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="border-border flex items-center overflow-hidden rounded-md border">
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setView(tab.key)}
              className={`px-2.5 py-1.5 text-xs whitespace-nowrap ${i > 0 ? 'border-border border-l' : ''} ${view === tab.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {view === 'bars' && (
            <div className="border-border flex items-center overflow-hidden rounded-md border">
              {[5, 10, 20, 0].map((n, i) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTopN(n)}
                  className={`px-2.5 py-1.5 text-xs whitespace-nowrap ${i > 0 ? 'border-border border-l' : ''} ${topN === n ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  {n === 0 ? t('statistics.allCountries') : `Top ${n}`}
                </button>
              ))}
            </div>
          )}

          {/* La vue en courbes porte déjà toutes les années sur son axe : un filtre
              annuel la réduirait à un point par pays. */}
          {view !== 'lines' && (
            <select
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm"
              value={year ?? 'all'}
              onChange={e => setYear(e.target.value === 'all' ? null : Number(e.target.value))}
            >
              <option value="all">{t('statistics.allYears')}</option>
              {[...years].reverse().map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>
      </div>

      {view === 'bars' && <CountryBars rows={topN > 0 ? rows.slice(0, topN) : rows} />}
      {view === 'map' && <CountryBubbleMap rows={rows} />}
      {view === 'sankey' && <CountrySankey rows={rows} />}
      {view === 'lines' && linesView}
    </div>
  )
}
