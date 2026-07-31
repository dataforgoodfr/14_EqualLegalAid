import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import layersFn from 'protomaps-themes-base'
import 'maplibre-gl/dist/maplibre-gl.css'
import grUrl from '@/assets/gr.json?url'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { ArrivalsGreeceRecord, ArrivalsGreeceYearly } from '@/hooks/useArrivalsGreece'
import { aggregateByYear } from '@/hooks/useArrivalsGreece'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { IndicatorInfoButton } from '@/components/ui/IndicatorInfoButton'
import { ArrivalsRouteSankey } from './ArrivalsRouteSankey'
import { ENTRY_COLORS, SEA_COLOR, LAND_COLOR } from './arrivalsColors'
import { useTranslation } from 'react-i18next'
import { BarChart2, LineChart as LineChartIcon } from 'lucide-react'
import { BarChart, Bar, LabelList, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CHART_GRID_PROPS } from '@/components/ui'

const PROTOMAP_KEY = import.meta.env.VITE_PROTOMAP_KEY as string

// Gris de mise en retrait des séries non survolées.
const DIMMED_FILL = '#E8ECF1'
const DIMMED_STROKE = '#D3DAE3'



// Un cercle par point d'entrée, posé sur l'île (ou sur le poste-frontière pour
// Evros). Les données Airtable ne portent pas de coordonnées — contrairement aux
// camps, où elles viennent de la base — donc on les fixe ici.
// NB : MapLibre attend [lng, lat].
// `other_islands` n'a volontairement pas de point : c'est un agrégat sans
// localisation, il resterait arbitraire de le poser quelque part. Il n'apparaît
// donc que dans le classement à droite.
const ENTRY_POINTS: {
  key: keyof ArrivalsGreeceYearly
  label: string
  coords: [number, number]
}[] = [
  { key: 'crete', label: 'Crete', coords: [24.81, 35.24] },
  { key: 'lesvos', label: 'Lesvos', coords: [26.27, 39.22] },
  { key: 'chios', label: 'Chios', coords: [26.00, 38.40] },
  { key: 'samos', label: 'Samos', coords: [26.83, 37.75] },
  { key: 'leros', label: 'Leros', coords: [26.85, 37.15] },
  { key: 'kos', label: 'Kos', coords: [27.20, 36.85] },
  { key: 'evros', label: 'Evros', coords: [26.50, 41.35] },
]

const buildPointsGeoJSON = (y: ArrivalsGreeceYearly | null) => ({
  type: 'FeatureCollection' as const,
  features: (y ? ENTRY_POINTS : [])
    .map(p => ({ p, value: y![p.key] as number }))
    .filter(({ value }) => value > 0)
    .map(({ p, value }) => ({
      type: 'Feature' as const,
      properties: { label: p.label, value, color: ENTRY_COLORS[p.key] },
      geometry: { type: 'Point' as const, coordinates: p.coords },
    })),
})

// Rayon en racine carrée de la valeur : c'est l'AIRE du cercle qui doit être
// proportionnelle au volume, sinon l'écart est visuellement surinterprété.
const radiusExpression = (maxValue: number): any => [
  'interpolate',
  ['linear'],
  ['sqrt', ['get', 'value']],
  0,
  3,
  Math.sqrt(Math.max(maxValue, 1)),
  32,
]

const SEA_ISLANDS: { key: keyof ArrivalsGreeceYearly, label: string }[] = [
  { key: 'crete', label: 'Crete' },
  { key: 'lesvos', label: 'Lesvos' },
  { key: 'chios', label: 'Chios' },
  { key: 'samos', label: 'Samos' },
  { key: 'other_islands', label: 'Other islands' },
  { key: 'kos', label: 'Kos' },
  { key: 'leros', label: 'Leros' },
]

// Découpage par point d'entrée du graphique d'évolution. Evros ferme la liste :
// c'est la seule arrivée terrestre, elle se lit mieux en haut de l'empilement.
const LOCATION_SERIES: { key: keyof ArrivalsGreeceYearly, label: string }[] = [
  ...SEA_ISLANDS,
  { key: 'evros', label: 'Evros' },
]

// Une ligne du graphique mensuel. La signature d'index couvre les colonnes de
// LOCATION_SERIES, ajoutées dynamiquement — d'où les casts à la lecture.
interface MonthlyRow {
  [field: string]: number | string
  key: string
  year: number
  month: number
  sea: number
  land: number
  total: number
}

function applyMapData(map: maplibregl.Map, yearData: ArrivalsGreeceYearly | null) {
  const source = map.getSource('points') as maplibregl.GeoJSONSource | undefined
  if (!source) return
  const data = buildPointsGeoJSON(yearData)
  source.setData(data as any)
  const max = Math.max(...data.features.map(f => f.properties.value), 1)
  map.setPaintProperty('points-circle', 'circle-radius', radiusExpression(max))
}

export function ArrivalsGreeceDetails({
  records,
  loading,
  error,
  customText,
}: {
  records: ArrivalsGreeceRecord[]
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'

  // Pas mensuel par défaut : la courbe montre les pics saisonniers que l'agrégat
  // annuel écrase.
  const [evolutionStep, setEvolutionStep] = useState<'year' | 'month'>('month')
  const [evolutionSplit, setEvolutionSplit] = useState<'mode' | 'location'>('mode')
  // Série sous le curseur dans le graphique en aires. À huit bandes empilées, le
  // seul survol du point ne dit pas laquelle on lit : les autres passent en gris.
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const mapLoadedRef = useRef(false)
  const yearDataRef = useRef<ArrivalsGreeceYearly | null>(null)

  const yearly = useMemo(() => aggregateByYear(records), [records])
  const years = useMemo(() => yearly.map(r => r.year).sort((a, b) => b - a), [yearly])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const effectiveYear = selectedYear ?? years[0] ?? null

  const yearData = useMemo(
    () => (effectiveYear ? yearly.find(r => r.year === effectiveYear) ?? null : null),
    [yearly, effectiveYear],
  )

  yearDataRef.current = yearData

  const seaRanking = useMemo(() => {
    if (!yearData) return []
    return SEA_ISLANDS
      .map(({ key, label }) => ({ label, color: ENTRY_COLORS[key], value: yearData[key] as number }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [yearData])

  // Infobulle sur mesure : celle de recharts perd le libellé de la série dès que le
  // formateur renvoie autre chose qu'une chaîne, or on veut mettre la série
  // survolée en gras ET dans sa couleur, les autres en gris.
  const renderTooltip = (props: any, formatLabel: (v: unknown) => string) => {
    const { active, payload, label } = props
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
        <div className="mb-1 font-semibold text-gray-900">{formatLabel(label)}</div>
        {payload.map((p: any) => {
          const strong = hoveredSeries !== null && p.dataKey === hoveredSeries
          return (
            <div
              key={p.dataKey}
              className="flex gap-6"
              style={{
                color: strong ? p.color : '#94A3B8',
                fontWeight: strong ? 700 : 400,
              }}
            >
              <span>{p.name}</span>
              <span className="ml-auto tabular-nums">
                {Number(p.value).toLocaleString('fr-FR')}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const formatMonthLabel = (v: unknown) => String(v).split('-').reverse().join('/')
  const formatYearLabel = (v: unknown) => t('statistics.yearLabel', { year: v as number })

  const evrosValue = yearData?.evros ?? 0
  const maxRankValue = Math.max(...seaRanking.map(d => d.value), evrosValue, 1)

  // Série annuelle complète — l'amplitude entre années se lit mal sur la carte,
  // qui ne montre qu'une année à la fois. Bornes prises dans les données plutôt
  // que fixées à 2019-2025, pour ne pas tronquer les millésimes à venir.
  // Empilé : les composantes se somment au total, la hauteur de barre reste donc
  // lisible comme le total annuel — ce qu'un groupement côte à côte perdrait.
  const evolutionData = useMemo(
    () => yearly.map(y => ({
      year: y.year,
      sea: y.total_arrivals_sea,
      land: y.total_arrivals_land,
      total: y.total_arrivals,
      ...Object.fromEntries(LOCATION_SERIES.map(s => [s.key, y[s.key] as number])),
    })),
    [yearly],
  )

  // Même série au pas mensuel. Agrégée par année-mois plutôt que prise ligne à
  // ligne : rien ne garantit qu'Airtable n'ait qu'un enregistrement par mois.
  const monthlyData = useMemo(() => {
    const map = new Map<string, MonthlyRow>()
    for (const r of records) {
      if (!r.year || !r.month) continue
      const key = `${r.year}-${String(r.month).padStart(2, '0')}`
      const existing = map.get(key)
      if (existing) {
        existing.sea += r.total_arrivals_sea
        existing.land += r.total_arrivals_land
        existing.total += r.total_arrivals
        for (const s of LOCATION_SERIES) {
          existing[s.key] = (existing[s.key] as number) + (r[s.key] as number)
        }
      }
      else {
        map.set(key, {
          key,
          year: r.year,
          month: r.month,
          sea: r.total_arrivals_sea,
          land: r.total_arrivals_land,
          total: r.total_arrivals,
          ...Object.fromEntries(LOCATION_SERIES.map(s => [s.key, r[s.key] as number])),
        })
      }
    }
    const rows = Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key))
    // Airtable porte les mois à venir de l'année courante avec des zéros. Tracés
    // tels quels, ils se lisent comme un arrêt des arrivées — on coupe la série
    // au dernier mois réellement renseigné.
    let last = rows.length - 1
    while (last >= 0 && rows[last].total === 0) last--
    return rows.slice(0, last + 1)
  }, [records])

  // Séries tracées dans le graphique d'évolution, selon le découpage choisi.
  const evolutionSeries = useMemo(
    () => evolutionSplit === 'mode'
      ? [
        // Les deux séries agrégées reprennent la palette de la carte : « Land »
        // est exactement Evros, « Sea » une teinte de la famille insulaire.
        { key: 'sea', label: t('statistics.seaArrivals'), color: SEA_COLOR },
        { key: 'land', label: t('statistics.landArrivals'), color: LAND_COLOR },
      ]
      : LOCATION_SERIES.map(s => ({ key: s.key as string, label: s.label, color: ENTRY_COLORS[s.key] })),
    [evolutionSplit, t],
  )

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.arrivalsGreece')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  // Map init (once)
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
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [23.5, 38.5],
      zoom: 4.8,
      attributionControl: false,
    })
    mapRef.current = map

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new maplibregl.NavigationControl(), 'top-left')
    map.on('error', e => console.error(e.error))

    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })

    map.on('load', () => {
      map.resize()
      map.addSource('greece', { type: 'geojson', data: grUrl })

      const layers = map.getStyle().layers
      // Find the index of the first symbol layer in the map style to put the new layers below it
      // https://maplibre.org/maplibre-gl-js/docs/examples/add-a-new-layer-below-labels/
      let firstSymbolId
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
          firstSymbolId = layers[i].id
          break
        }
      }

      // Les régions ne portent plus la donnée : elles servent de fond
      // géographique. Peindre une périphérie entière (le Dodécanèse, ~50 îles)
      // pour quelques points de débarquement surinterprétait la géographie.
      map.addLayer({
        id: 'region-fill',
        type: 'fill',
        source: 'greece',
        paint: { 'fill-color': '#e5e7eb', 'fill-opacity': 0.85 },
      }, firstSymbolId)
      map.addLayer({
        id: 'region-border',
        type: 'line',
        source: 'greece',
        paint: { 'line-color': '#ffffff', 'line-width': 0.8, 'line-opacity': 0.9 },
      }, firstSymbolId)

      map.addSource('points', { type: 'geojson', data: buildPointsGeoJSON(yearDataRef.current) as any })
      map.addLayer({
        id: 'points-circle',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': radiusExpression(1),
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.75,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      })

      mapLoadedRef.current = true
      applyMapData(map, yearDataRef.current)

      map.on('mousemove', 'points-circle', (e) => {
        if (!e.features?.length) return
        map.getCanvas().style.cursor = 'pointer'
        const { label, value } = e.features[0].properties as { label: string, value: number }
        popup
          .setHTML(`
            <div style="font-size:12px;font-weight:600;margin-bottom:4px">${label}</div>
            <div style="font-size:12px">&#8226; ${Number(value).toLocaleString('fr-FR')}</div>
          `)
          .setLngLat(e.lngLat)
          .addTo(map)
      })

      map.on('mouseleave', 'points-circle', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
      })
    })

    return () => {
      mapLoadedRef.current = false
      popup.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Re-apply data on year change
  useEffect(() => {
    const map = mapRef.current
    // Avant `load`, le handler de load applique lui-même les refs à jour. Attendre
    // `once('load')` ici bloquerait : l'événement a pu être déjà émis.
    if (!map || !mapLoadedRef.current) return
    applyMapData(map, yearData)
  }, [yearData])

  return (
    <div className="mx-auto my-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold whitespace-pre-line" style={{ color: '#003366' }}>{title}</h2>
              <IndicatorInfoButton text={information} />
            </div>
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              className="flex-shrink-0 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
              value={effectiveYear ?? ''}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Card body */}
        <div className="space-y-4 p-6">

          {/* Texte explicatif + key figure. Mêmes largeurs que la rangée carte +
              classement en dessous (w-64, gap-4) pour que les deux colonnes de
              droite s'alignent au pixel. */}
          <div className="flex flex-col gap-4 md:flex-row">
            {(explanatoryTitle || explanatoryText) && (
              <div className="rounded-lg border border-gray-200 p-5 md:flex-1">
                {explanatoryTitle && (
                  <h3 className="mb-2 text-sm font-bold text-gray-900 whitespace-pre-line">{explanatoryTitle}</h3>
                )}
                {explanatoryText && (
                  <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{explanatoryText}</p>
                )}
              </div>
            )}

            {yearData && (
              <div className="flex flex-col justify-center rounded-lg border border-gray-200 p-5 md:w-64 md:flex-shrink-0">
                <p className="text-4xl leading-none font-bold tabular-nums text-gray-900">
                  {yearData.total_arrivals.toLocaleString('fr-FR')}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {t('statistics.totalArrivalsInYear', { year: effectiveYear })}
                </p>
              </div>
            )}
          </div>

          {/* Map + ranking */}
          <div className="flex gap-4" style={{ height: 460 }}>
            <div className="relative flex-1 overflow-hidden rounded-lg border border-gray-200">
              <div ref={containerRef} className="h-full w-full" />
              {loading && (
                <div className="text-muted-foreground absolute inset-0 flex items-center justify-center bg-white/70 text-sm">
                  {t('loadingData')}
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 p-4">
                  <ErrorMessage message={error} onRetry={() => window.location.reload()} />
                </div>
              )}
            </div>

            {/* Ranking panel */}
            <div className="w-64 flex-shrink-0 overflow-y-auto rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-bold text-gray-900">{t('statistics.rankingLocations')}</h3>

              <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {t('statistics.seaArrivals')}
              </h4>
              <div className="mb-3 space-y-1.5">
                {seaRanking.map(({ label, color, value }) => (
                  <div key={label}>
                    <span className="text-xs text-gray-700">{label}</span>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="h-4 flex-1 overflow-hidden rounded-sm bg-gray-100">
                        <div
                          className="h-full rounded-sm"
                          style={{ width: `${(value / maxRankValue) * 100}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="w-12 flex-shrink-0 text-right text-xs text-gray-700 tabular-nums">
                        {value.toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {t('statistics.landArrivals')}
              </h4>
              {/* pas de libellé « Evros » ici : le titre de section le porte déjà */}
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-4 flex-1 overflow-hidden rounded-sm bg-gray-100">
                    <div
                      className="h-full rounded-sm"
                      style={{ width: `${(evrosValue / maxRankValue) * 100}%`, backgroundColor: ENTRY_COLORS.evros }}
                    />
                  </div>
                  <span className="w-12 flex-shrink-0 text-right text-xs text-gray-700 tabular-nums">
                    {evrosValue.toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Évolution — la carte porte une seule année, ce graphique la période
              entière. C'est ici que se règlent découpage et pas de temps. */}
          {evolutionData.length > 1 && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-gray-900">
                  {t('statistics.arrivalsEvolutionRange', {
                    start: evolutionData[0].year,
                    end: evolutionData[evolutionData.length - 1].year,
                  })}
                </h3>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {/* Découpage des séries : mer/terre ou point d'entrée */}
                  <div className="border-border flex items-center overflow-hidden rounded-md border">
                    <button
                      type="button"
                      className={`px-2.5 py-1.5 text-xs whitespace-nowrap ${evolutionSplit === 'mode' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                      onClick={() => setEvolutionSplit('mode')}
                    >
                      {t('statistics.bySeaLand')}
                    </button>
                    <button
                      type="button"
                      className={`border-border border-l px-2.5 py-1.5 text-xs whitespace-nowrap ${evolutionSplit === 'location' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                      onClick={() => setEvolutionSplit('location')}
                    >
                      {t('statistics.byEntryPoint')}
                    </button>
                  </div>

                  {/* Pas de temps : année ou mois */}
                  <div className="border-border flex items-center overflow-hidden rounded-md border">
                    <button
                      type="button"
                      className={`flex items-center justify-center px-2.5 py-1.5 ${evolutionStep === 'year' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                      title={t('statistics.byYear')}
                      onClick={() => setEvolutionStep('year')}
                    >
                      <BarChart2 size={14} />
                    </button>
                    <button
                      type="button"
                      className={`border-border flex items-center justify-center border-l px-2.5 py-1.5 ${evolutionStep === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                      title={t('statistics.byMonth')}
                      onClick={() => setEvolutionStep('month')}
                    >
                      <LineChartIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {evolutionStep === 'year'
                    ? (
                      <BarChart
                        data={evolutionData}
                        margin={{ top: 20, right: 16, left: 16, bottom: 8 }}
                        onMouseLeave={() => setHoveredSeries(null)}
                      >
                        <CartesianGrid {...CHART_GRID_PROPS} />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} tick={{ fontSize: 11 }} />
                        <Tooltip
                          content={p => renderTooltip(p, formatYearLabel)}
                          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        />
                        <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        {/* Volontairement indépendant du sélecteur d'année : ce graphique
                            porte sur la période entière, la carte sur une année. */}
                        {evolutionSeries.map((s, i) => {
                          const isTop = i === evolutionSeries.length - 1
                          const dimmed = hoveredSeries !== null && hoveredSeries !== s.key
                          return (
                            <Bar
                              key={s.key}
                              dataKey={s.key}
                              stackId="arrivals"
                              name={s.label}
                              fill={dimmed ? DIMMED_FILL : s.color}
                              radius={isTop ? [3, 3, 0, 0] : undefined}
                              onMouseEnter={() => setHoveredSeries(s.key)}
                              // Même raison que pour les aires : sans ça recharts anime
                              // la transition et la mise en avant traîne.
                              isAnimationActive={false}
                              style={{ cursor: 'pointer' }}
                            >
                              {/* Total posé sur la barre du haut de la pile : c'est le seul
                                  endroit où il coiffe l'empilement entier. */}
                              {isTop && (
                                <LabelList
                                  dataKey="total"
                                  position="top"
                                  offset={6}
                                  className="fill-gray-600"
                                  style={{ fontSize: 10 }}
                                  formatter={v => Number(v ?? 0).toLocaleString('fr-FR')}
                                />
                              )}
                            </Bar>
                          )
                        })}
                      </BarChart>
                    )
                    : evolutionSplit === 'mode'
                      ? (
                        // Deux séries seulement : des courbes se suivent sans se gêner et
                        // laissent comparer mer et terre directement, ce que l'empilement
                        // interdit — le segment du haut y est lu depuis une base mouvante.
                        <LineChart data={monthlyData} margin={{ top: 20, right: 16, left: 16, bottom: 8 }}>
                          <CartesianGrid {...CHART_GRID_PROPS} />
                          {/* Un seul repère par an : 80 mois d'étiquettes seraient illisibles. */}
                          <XAxis
                            dataKey="key"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11 }}
                            interval={0}
                            tickFormatter={k => k.endsWith('-01') ? k.slice(0, 4) : ''}
                          />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} tick={{ fontSize: 11 }} />
                          <Tooltip
                            content={p => renderTooltip(p, formatMonthLabel)}
                          />
                          <Legend iconType="line" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                          {evolutionSeries.map(s => (
                            <Line
                              key={s.key}
                              type="monotone"
                              dataKey={s.key}
                              name={s.label}
                              stroke={s.color}
                              strokeWidth={2}
                              dot={false}
                            />
                          ))}
                        </LineChart>
                      )
                      : (
                        <AreaChart
                          data={monthlyData}
                          margin={{ top: 20, right: 16, left: 16, bottom: 8 }}
                          onMouseLeave={() => setHoveredSeries(null)}
                        >
                          <CartesianGrid {...CHART_GRID_PROPS} />
                          <XAxis
                            dataKey="key"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11 }}
                            interval={0}
                            tickFormatter={k => k.endsWith('-01') ? k.slice(0, 4) : ''}
                          />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} tick={{ fontSize: 11 }} />
                          <Tooltip
                            content={p => renderTooltip(p, formatMonthLabel)}
                          />
                          <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                          {/* Aires empilées plutôt que courbes superposées : à 8 séries,
                              des lignes s'entremêlent sans être lisibles. L'empilement
                              garde en prime la même lecture du total que les barres. */}
                          {evolutionSeries.map((s) => {
                            const dimmed = hoveredSeries !== null && hoveredSeries !== s.key
                            return (
                              <Area
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.label}
                                stackId="arrivals"
                                stroke={dimmed ? DIMMED_STROKE : s.color}
                                strokeWidth={1}
                                fill={dimmed ? DIMMED_FILL : s.color}
                                fillOpacity={dimmed ? 1 : 0.85}
                                onMouseEnter={() => setHoveredSeries(s.key)}
                                // Sans quoi recharts anime la transition de couleur et
                                // la mise en avant traîne d'une demi-seconde.
                                isAnimationActive={false}
                                style={{ cursor: 'pointer' }}
                              />
                            )
                          })}
                        </AreaChart>
                      )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sankey des voies d'entrée — piste à évaluer. Les trois routes se
              reconstituent exactement dans la table, ce qui autorise un diagramme
              de flux sans perte. */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-900">{t('statistics.arrivalsByRoute')}</h3>
            <ArrivalsRouteSankey records={records} />
          </div>
        </div>

        {/* Card footer */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="space-y-1 border-t border-gray-100 bg-gray-50/60 px-6 py-3 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>
                {customText.source && (
                  <>
                    <span className="font-medium text-gray-600">
                      {t('statistics.source')}
                      {' '}
                      :
                    </span>
                    {' '}
                    <a
                      href={customText.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline transition-colors hover:text-gray-800"
                    >
                      {customText.source}
                    </a>
                  </>
                )}
              </span>
              {customText.last_updated_on && (
                <span>
                  <span className="font-medium text-gray-600">
                    {t('statistics.lastUpdated')}
                    {' '}
                    :
                  </span>
                  {' '}
                  {customText.last_updated_on}
                </span>
              )}
            </div>
            {customText.sourceText && (
              <p className="italic text-gray-400 whitespace-pre-line">{customText.sourceText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
