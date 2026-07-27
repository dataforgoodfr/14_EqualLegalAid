import { useMemo, useState, useRef, useEffect } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { AsylumCampRecord, AsylumSeekersCampsRecord } from '@/hooks/useAsylumSeekersCamps'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { ChartContainer, ChartTooltipContent, IndicatorInfoButton, CHART_GRID_PROPS } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import maplibregl, { type ExpressionSpecification } from 'maplibre-gl'
import layersFn from 'protomaps-themes-base'
import 'maplibre-gl/dist/maplibre-gl.css'

const PROTOMAP_KEY = import.meta.env.VITE_PROTOMAP_KEY as string

const REGION_COLORS = [
  '#04356C', '#1E6FA5', '#3F9FD8', '#6BB8E8', '#9AD0F2', '#C5E5F8',
  '#7C3AED', '#A78BFA', '#B45309', '#D97706', '#065F46', '#059669',
]
const CAMP_TYPES = [
  "CCAC",
  "RIC",
  "Site",
] as const
const CAMP_COLORS: Record<string, string> = {
  'CCAC': '#04356C',
  'RIC': '#d97706',
  'Site': '#0090ff',
}
// Display-only label override — keeps the underlying "Site" data key intact
// (it's what Airtable and the filter logic use) while showing nicer copy.
const CAMP_TYPE_LABELS: Record<string, string> = {
  'Site': 'Facilities',
}
// ESTIA data stops very early in the series and was flagged as too confusing to show.
const EXCLUDED_CAMP_TYPE = 'ESTIA'

// Camp types are specified in a string with additional data,
// but the camp type is always the first word in the string.
// So we split on spaces and take the first word as the camp type.
function isCampType(record: { type: string }, campType: string): boolean {
  return record.type.includes(campType)
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Formats the "{year}-{month}" key used internally for chart data
// (e.g. "2025-6") into a readable "Month YYYY" label.
function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const name = MONTH_NAMES[(month ?? 1) - 1]
  return name ? `${name} ${year}` : yearMonth
}

const convertToGeoJSON = (arr: AsylumCampRecord[]) => ({
  type: 'FeatureCollection' as const,
  features: arr.map((item) => ({
    type: 'Feature' as const,
    properties: { name: item.name, type: item.type },
    geometry: {
      type: 'Point' as const,

      // Note: MapLibre uses [lng, lat]
      coordinates: [item.longitude, item.latitude]
    }
  }))
});

export function AsylumSeekersCampsDetails({
  records,
  locations,
  loading,
  error,
  customText,
}: {
  records: AsylumSeekersCampsRecord[]
  locations: AsylumCampRecord[]
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [selectedCampType, setSelectedCampType] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')

  // ESTIA data stops very early in the series, so it's excluded everywhere (chart, map, key figure).
  const visibleRecords = useMemo(
    () => records.filter(r => !r.type.includes(EXCLUDED_CAMP_TYPE)),
    [records],
  )

  // Collect all region names based on the data records.
  const regions = useMemo(() => {
    const set = new Set<string>()
    for (const r of visibleRecords) if (r.region) set.add(r.region)
    return Array.from(set).sort()
  }, [visibleRecords])

  // Cache a lookup of record ids to their camp types.
  // Some camps are labeled as multiple types, in particular "CCAC/RIC".
  const campTypes = useMemo(() => {
    const types = new Map<string, string[]>()
    for (const r of visibleRecords) {
      types.set(r.id, CAMP_TYPES.filter(t => isCampType(r, t)));
    }
    return types
  }, [visibleRecords])

  // All year-month combinations available, most recent last.
  const dates = useMemo(() => {
    const set = new Set<string>()
    for (const r of visibleRecords) set.add(`${r.year}-${r.month}`)
    return Array.from(set).sort()
  }, [visibleRecords])
  const effectiveDate = selectedDate || dates[dates.length - 1] || ''

  // Snapshot of records for the selected month, matching the type/region filters.
  const snapshotRecords = useMemo(() => {
    return visibleRecords.filter(r => {
      return `${r.year}-${r.month}` === effectiveDate
        && (selectedRegion === 'all' || r.region === selectedRegion)
        && (selectedCampType === 'all' || isCampType(r, selectedCampType))
    })
  }, [visibleRecords, effectiveDate, selectedRegion, selectedCampType])

  // Once a specific region is picked there's only one bar left to show if we keep
  // grouping by region, so switch the breakdown to camp type instead.
  const groupByType = selectedRegion !== 'all'

  const snapshotData = useMemo(() => {
    const totals = new Map<string, number>()
    for (const r of snapshotRecords) {
      const groups = groupByType ? (campTypes.get(r.id) || []) : [r.region]
      for (const group of groups) {
        totals.set(group, (totals.get(group) ?? 0) + r.asylum_seekers)
      }
    }
    const keys = groupByType
      ? (selectedCampType === 'all' ? CAMP_TYPES : [selectedCampType])
      : regions
    return keys
      .map((key, i) => ({
        group: groupByType ? (CAMP_TYPE_LABELS[key] ?? key) : key,
        value: totals.get(key) ?? 0,
        color: groupByType ? CAMP_COLORS[key] : REGION_COLORS[i % REGION_COLORS.length],
      }))
      .filter(d => d.value > 0)
  }, [snapshotRecords, groupByType, selectedCampType, regions, campTypes])

  const keyFigure = useMemo(() => {
    if (snapshotRecords.length === 0) return null
    return {
      total: snapshotRecords.reduce((sum, r) => sum + r.asylum_seekers, 0),
      date: effectiveDate,
    }
  }, [snapshotRecords, effectiveDate])

  // Looks up which region a named location belongs to, so the map (which only has
  // name/type/coordinates, no region) can be filtered by the region select too.
  // Note: `location` only holds the coarse "Northern/Southern Greece/Islands" split —
  // the individual camp name(s) live in `area` instead (sometimes comma-separated
  // when one record covers several camps), so that's what has to be matched against.
  const nameToRegion = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of visibleRecords) {
      if (!r.area || !r.region) continue
      for (const name of r.area.split(',').map(n => n.trim()).filter(Boolean)) {
        if (!map.has(name)) map.set(name, r.region)
      }
    }
    return map
  }, [visibleRecords])

  // The map points, filtered to match the currently selected camp type / region —
  // previously the map always showed every location regardless of the filters.
  const visibleLocations = useMemo(() => {
    return locations.filter(loc => {
      if (loc.type.includes(EXCLUDED_CAMP_TYPE)) return false
      if (selectedCampType !== 'all' && !isCampType(loc, selectedCampType)) return false
      if (selectedRegion !== 'all' && nameToRegion.get(loc.name) !== selectedRegion) return false
      return true
    })
  }, [locations, selectedCampType, selectedRegion, nameToRegion])

  const visibleLocationsRef = useRef<AsylumCampRecord[]>([])
  visibleLocationsRef.current = visibleLocations

  // Map init (once)
  useEffect(() => {
    // - Wait until container and locations are ready;
    // - Don't re-run if the map is already setup;
    if (!containerRef.current || locations.length == 0 || mapRef.current) return

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
      map.addSource('points-source', {
        type: 'geojson',
        data: convertToGeoJSON(visibleLocationsRef.current),
        generateId: true
      });

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

      const fallbackColor = "#aaaaaa";
      const circleColorExpression = [
        'match',
        ['get', 'type'],
        ...Object.entries(CAMP_COLORS).flat(),
        fallbackColor
      ] as unknown as ExpressionSpecification;

      map.addLayer({
        id: 'points-circle',
        type: 'circle',
        source: 'points-source',
        paint: {
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-color': circleColorExpression,
        }
      }, firstSymbolId);

      map.on('mousemove', 'points-circle', (e) => {
        if (!e.features?.length) return
        map.getCanvas().style.cursor = 'pointer'
        const name = e.features[0].properties?.name as string | undefined
        if (!name) return
        popup
          .setHTML(`
            <div style="font-size:12px;font-weight:600;margin-bottom:4px">${name}</div>
          `)
          .setLngLat(e.lngLat)
          .addTo(map)
      });

      map.on('mouseleave', 'points-circle', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
      })
    })

    return () => {
      popup.remove()
      map.remove()
      mapRef.current = null
    }
  }, [locations])

  // Re-apply the point source whenever the camp-type/region filters change.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      const source = map.getSource('points-source') as maplibregl.GeoJSONSource | undefined
      source?.setData(convertToGeoJSON(visibleLocations))
    }
    if (map.isStyleLoaded()) apply()
    else {
      map.once('load', apply)
      return () => { map.off('load', apply) }
    }
  }, [visibleLocations])

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.asylumSeekersCamps')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />
  if (records.length === 0) return <p className="text-muted-foreground text-sm p-6">{t('statistics.noData')}</p>

  return (
    <div className="mx-auto max-w-5xl my-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold" style={{ color: '#04356C' }}>{title}</h2>
              <IndicatorInfoButton text={information} />
            </div>
            {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
          </div>

          <div className="flex gap-2">
            <select
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm"
              value={effectiveDate}
              onChange={e => setSelectedDate(e.target.value)}
            >
              {[...dates].reverse().map(d => <option key={d} value={d}>{formatYearMonth(d)}</option>)}
            </select>

            <select
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm"
              value={selectedCampType}
              onChange={e => setSelectedCampType(e.target.value)}
            >
              <option value="all">{t('statistics.allTypes')}</option>
              {CAMP_TYPES.map(type => <option key={type} value={type}>{CAMP_TYPE_LABELS[type] ?? type}</option>)}
            </select>

            <select
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm"
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
            >
              <option value="all">{t('statistics.allRegions')}</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Card body */}
        <div className="space-y-6 p-6">

          <div className="grid grid-cols-[2fr_1fr] gap-4">
            {(explanatoryTitle || explanatoryText) && (
              <div className="rounded-lg border border-gray-200 p-5">
                {explanatoryTitle && (
                  <h3 className="text-sm font-bold text-gray-900 mb-3">{explanatoryTitle}</h3>
                )}
                {explanatoryText && (
                  <p className="text-sm text-gray-600 leading-relaxed">{explanatoryText}</p>
                )}
              </div>
            )}

            {keyFigure && (
              <div className="rounded-lg border border-gray-200 p-5">
                <p className="text-sm font-bold text-gray-900 mb-4">
                  {t('statistics.totalAsylumSeekersInCamps')}
                </p>
                <p className="text-6xl font-bold text-gray-900 leading-none tabular-nums">
                  {Number(keyFigure.total).toLocaleString('fr-FR')}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {formatYearMonth(keyFigure.date)}
                </p>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex gap-4" style={{ height: 360 }}>
            <div className="relative basis-1/3 max-w-[33.333%] overflow-hidden rounded-lg border border-gray-200">
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

              {/* Key */}
              <div className="absolute bottom-5 left-5 bg-white p-2.5 rounded-[4px] text-xs z-10">
                {Object.entries(CAMP_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center mb-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: color }}
                    />
                    {CAMP_TYPE_LABELS[type] ?? type}
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart — snapshot for the selected month */}
            <div className="w-64 flex-1 min-w-0 overflow-y-auto rounded-lg border border-gray-200 p-4">
              <ChartContainer config={{}} className="h-80 w-full">
                <BarChart data={snapshotData} margin={{ top: 4, right: 8, left: 8, bottom: 24 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis
                    dataKey="group"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    wrapperStyle={{ zIndex: 1000 }}
                    content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {snapshotData.map(d => <Cell key={d.group} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </div>

        </div>

        {/* Card footer */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="space-y-1 border-t border-gray-100 bg-gray-50/60 px-6 py-3 text-xs text-gray-500">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
              {customText.source && (
                <span>
                  <span className="font-medium text-gray-600">{t('statistics.source')}:</span>
                  {' '}
                  <a href={customText.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800 transition-colors">
                    {customText.source}
                  </a>
                </span>
              )}
              {customText.last_updated_on && (
                <span>
                  <span className="font-medium text-gray-600">{t('statistics.lastUpdated')}:</span>
                  {' '}
                  {customText.last_updated_on}
                </span>
              )}
            </div>
            {customText.sourceText && (
              <p className="italic text-gray-400">{customText.sourceText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
