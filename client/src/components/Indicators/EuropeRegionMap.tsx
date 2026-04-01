import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import maplibregl from 'maplibre-gl'
import layersFn from 'protomaps-themes-base'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Map as MapIcon, LayoutList } from 'lucide-react'
import countriesUrl from '@/assets/countries.geojson?url'
import { useMapIndicators } from '@/hooks/useMapIndicators'
import type { MapIndicatorRecord } from '@/hooks/useMapIndicators'
import { CountryMapPopup } from './CountryMapPopup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { IndicatorsDataTable } from './IndicatorsDataTable'

const PROTOMAP_KEY = import.meta.env.VITE_PROTOMAP_KEY as string
const ISO_PROP = 'ISO3166-1-Alpha-2'
const GREECE_CODE = 'GR'

// 5-step ELA blues
const BUCKET_COLORS = ['#bfdbfe', '#7db9f5', '#3b82f6', '#1d56c4', '#1e3a8a']

// Fixed thresholds — independent of data
const TOTAL_THRESHOLDS = [5_000, 50_000, 100_000, 200_000]
const TOTAL_LABELS = ['< 5K', '5K – 50K', '50K – 100K', '100K – 200K', '> 200K']
const PER_CAPITA_THRESHOLDS = [10, 100, 250, 500]
const PER_CAPITA_LABELS = ['< 10', '10 – 100', '100 – 250', '250 – 500', '> 500']

type ValueKey = 'total_applicants' | 'total_applicants_per_capita'

function getBucketColor(value: number, thresholds: number[]): string {
  if (!thresholds.length) return BUCKET_COLORS[0]
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) return BUCKET_COLORS[i]
  }
  return BUCKET_COLORS[BUCKET_COLORS.length - 1]
}

function buildColorExpression(
  records: MapIndicatorRecord[],
  valueKey: ValueKey,
  thresholds: number[],
) {
  if (!records.length) return '#dbeafe'
  const unique = Array.from(new Map(records.map(r => [r.country_code, r])).values())
  return [
    'match',
    ['get', ISO_PROP],
    ...unique.flatMap(r => [r.country_code, getBucketColor(r[valueKey], thresholds)]),
    '#e5e7eb',
  ]
}

function applyMapData(
  map: maplibregl.Map,
  records: MapIndicatorRecord[],
  perCapita: boolean,
  thresholds: number[],
) {
  if (!records.length) return
  const valueKey: ValueKey = perCapita ? 'total_applicants_per_capita' : 'total_applicants'
  const active = records.filter(r => r.total_applicants > 0)
  const codes = [...new Set(active.map(r => r.country_code))]
  const noMatch = ['==', ['get', ISO_PROP], ''] as unknown
  const countryFilter: any = codes.length ? ['match', ['get', ISO_PROP], codes, true, false] : noMatch
  map.setFilter('region-fill', countryFilter)
  map.setFilter('region-border', countryFilter)
  map.setFilter('country-hover', countryFilter)
  map.setPaintProperty('region-fill', 'fill-color', buildColorExpression(active, valueKey, thresholds) as any)
}

function formatValue(n: number, perCapita: boolean) {
  if (perCapita) return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString('en-US')
}

export function EuropeRegionMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  const popupRootRef = useRef<ReturnType<typeof createRoot> | null>(null)
  const dataByCodeRef = useRef<Record<string, MapIndicatorRecord>>({})
  const perCapitaRef = useRef(false)
  const yearRecordsRef = useRef<MapIndicatorRecord[]>([])
  const thresholdsRef = useRef<number[]>([])

  const { records, loading, error } = useMapIndicators()
  const [perCapita, setPerCapita] = useState(false)
  const [view, setView] = useState<'map' | 'table'>('map')


  const years = useMemo(
    () => [...new Set(records.filter(r => r.total_applicants > 0).map(r => r.year))].sort((a, b) => b - a),
    [records],
  )
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const effectiveYear = selectedYear ?? years[0] ?? null

  const yearRecords = useMemo(
    () => (effectiveYear ? records.filter(r => r.year === effectiveYear) : []),
    [records, effectiveYear],
  )

  const activeRecords = useMemo(
    () => yearRecords.filter(r => r.total_applicants > 0),
    [yearRecords],
  )

  const valueKey: ValueKey = perCapita ? 'total_applicants_per_capita' : 'total_applicants'

  const thresholds = perCapita ? PER_CAPITA_THRESHOLDS : TOTAL_THRESHOLDS

  const bucketLabels = BUCKET_COLORS.map((color, i) => ({
    color,
    label: perCapita ? PER_CAPITA_LABELS[i] : TOTAL_LABELS[i],
  }))

  // EU27 aggregate row
  const euRecord = useMemo(
    () => yearRecords.find(r => r.country_code === 'EU27'),
    [yearRecords],
  )

  // Greece record
  const greeceRecord = useMemo(
    () => yearRecords.find(r => r.country_code === GREECE_CODE),
    [yearRecords],
  )

  // Keep refs in sync
  perCapitaRef.current = perCapita
  yearRecordsRef.current = yearRecords
  thresholdsRef.current = thresholds
  dataByCodeRef.current = Object.fromEntries(yearRecords.map(r => [r.country_code, r]))

  // ── Map initialisation (runs once) ──────────────────────────────────────────
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
      center: [13, 54],
      zoom: 2.5,
      attributionControl: false,
    })
    mapRef.current = map

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.on('error', e => console.error(e.error))

    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })

    map.on('load', () => {
      map.resize()
      map.addSource('countries', { type: 'geojson', data: countriesUrl })

      map.addLayer({
        id: 'region-fill',
        type: 'fill',
        source: 'countries',
        filter: ['==', ['get', ISO_PROP], ''],
        paint: { 'fill-color': '#dbeafe', 'fill-opacity': 0.85 },
      })
      map.addLayer({
        id: 'region-border',
        type: 'line',
        source: 'countries',
        filter: ['==', ['get', ISO_PROP], ''],
        paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.85 },
      })
      map.addLayer({
        id: 'country-hover',
        type: 'fill',
        source: 'countries',
        filter: ['==', ['get', ISO_PROP], ''],
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 },
      })

      map.on('mousemove', 'country-hover', (e) => {
        if (!e.features?.length) return
        map.getCanvas().style.cursor = 'pointer'
        const isoCode = e.features[0].properties?.[ISO_PROP] as string | undefined
        const countryData = isoCode ? dataByCodeRef.current[isoCode] : undefined
        if (!countryData) return

        popupRootRef.current?.unmount()
        const container = document.createElement('div')
        const root = createRoot(container)
        flushSync(() => {
          root.render(
            <CountryMapPopup
              record={countryData}
              perCapita={perCapitaRef.current}
            />,
          )
        })
        popupRootRef.current = root
        popup.setDOMContent(container).setLngLat(e.lngLat).addTo(map)
      })

      map.on('mouseleave', 'country-hover', () => {
        map.getCanvas().style.cursor = ''
        popupRootRef.current?.unmount()
        popupRootRef.current = null
        popup.remove()
      })

      applyMapData(map, yearRecordsRef.current, perCapitaRef.current, thresholdsRef.current)
    })

    return () => {
      popupRootRef.current?.unmount()
      popup.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ── Re-apply whenever data / year / perCapita changes ───────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => applyMapData(map, yearRecords, perCapita, thresholds)
    if (map.isStyleLoaded()) {
      apply()
    }
    else {
      // Map not ready yet — apply as soon as it is
      map.once('load', apply)
      return () => { map.off('load', apply) }
    }
  }, [yearRecords, perCapita, thresholds])

  return (
    <section className="p-6">
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Number of asylum applications in Europe</h2>

        <div className="flex items-center gap-3">
          {/* Per-capita toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="per-capita-switch" className="text-muted-foreground text-sm select-none">
              Per capita
            </Label>
            <Switch
              id="per-capita-switch"
              checked={perCapita}
              onCheckedChange={setPerCapita}
            />
          </div>

          {/* Year selector */}
          <Select
            value={effectiveYear?.toString() ?? ''}
            onValueChange={v => setSelectedYear(Number(v))}
            disabled={loading || years.length === 0}
          >
            <SelectTrigger size="sm" className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle buttons */}
          <div className="border-border flex items-center overflow-hidden rounded-md border">
            <button
              className={`flex items-center justify-center px-2.5 py-1.5 ${view === 'map' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
              title="Map view"
              onClick={() => setView('map')}
            >
              <MapIcon size={14} />
            </button>
            <button
              className={`border-border flex items-center justify-center border-l px-2.5 py-1.5 ${view === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
              title="Table view"
              onClick={() => setView('table')}
            >
              <LayoutList size={14} />
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-destructive mb-2 text-sm">{error}</p>}

      {/* ── TABLE ─────────────────────────────────────────────────────── */}

      <div className={`border-border overflow-hidden rounded-lg border ${view === 'table' ? '' : 'hidden'}`} style={{ height: '480px' }}>
        <IndicatorsDataTable
          data={activeRecords.filter(r => r.country_code !== 'EU27')}
          perCapita={perCapita}
        />
      </div>

      {/* ── MAP ───────────────────────────────────────────────────────── */}

      <div className={`border-border flex overflow-hidden rounded-lg border ${view === 'map' ? '' : 'hidden'}`} style={{ height: '480px' }}>

        <div className="bg-muted/30 border-border flex flex-col justify-between border-r p-5" style={{ width: 220, flexShrink: 0 }}>
          <div>
            <p className="text-muted-foreground mb-1 text-[11px] font-medium tracking-wide uppercase">
              Greece
            </p>
            <p className="text-foreground mb-4 text-sm leading-snug">
              {perCapita
                ? 'First-time asylum applicants per capita'
                : 'First-time asylum applicants'}
            </p>

            {greeceRecord
              ? (
                <>
                  <p className="text-primary mb-1 text-4xl leading-none font-bold tabular-nums">
                    {formatValue(
                      perCapita
                        ? greeceRecord.first_time_applicants_per_capita
                        : greeceRecord.first_time_applicants,
                      perCapita,
                    )}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {effectiveYear}
                  </p>
                </>
              )
              : (
                <p className="text-muted-foreground text-sm">—</p>
              )}
          </div>

          {bucketLabels.length > 0 && (
            <div>
              {euRecord && (
                <p className="text-muted-foreground mb-2 text-[11px]">
                  EU =
                  {' '}
                  <span className="font-semibold tabular-nums">
                    {formatValue(euRecord[valueKey], perCapita)}
                  </span>
                </p>
              )}
              <p className="text-muted-foreground mb-1.5 text-[10px] font-medium tracking-wide uppercase">
                {perCapita ? 'Per capita' : 'Total applicants'}
              </p>
              <div className="space-y-1">
                {[...bucketLabels].reverse().map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="h-3 w-5 flex-shrink-0 rounded-sm" style={{ backgroundColor: color }} />
                    <span className="text-muted-foreground text-[10px] tabular-nums">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div ref={containerRef} className="h-full w-full" />

          {loading && (
            <div className="text-muted-foreground absolute inset-0 flex items-center justify-center bg-white/60 text-sm">
              Loading data…
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
