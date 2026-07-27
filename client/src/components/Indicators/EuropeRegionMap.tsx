import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import maplibregl from 'maplibre-gl'
import layersFn from 'protomaps-themes-base'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Map as MapIcon, LayoutList, Layers } from 'lucide-react'
import countriesUrl from '@/assets/countries.geojson?url'
import { useMapIndicators } from '@/hooks/useMapIndicators'
import type { MapIndicatorRecord } from '@/hooks/useMapIndicators'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { CountryMapPopup } from './CountryMapPopup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { IndicatorsDataTable } from './IndicatorsDataTable'
import { IndicatorInfoButton } from '@/components/ui/IndicatorInfoButton'
import { useTranslation } from 'react-i18next'

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
  if (perCapita) return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
  return n.toLocaleString('fr-FR')
}

export function EuropeRegionMap({ customText }: { customText?: IndicatorCustomText | null }) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'
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
  const [showLegend, setShowLegend] = useState(false)

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

      map.addLayer({
        id: 'region-fill',
        type: 'fill',
        source: 'countries',
        filter: ['==', ['get', ISO_PROP], ''],
        paint: { 'fill-color': '#dbeafe', 'fill-opacity': 0.85 },
      }, firstSymbolId)
      map.addLayer({
        id: 'region-border',
        type: 'line',
        source: 'countries',
        filter: ['==', ['get', ISO_PROP], ''],
        paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.85 },
      }, firstSymbolId)
      map.addLayer({
        id: 'country-hover',
        type: 'fill',
        source: 'countries',
        filter: ['==', ['get', ISO_PROP], ''],
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 },
      }, firstSymbolId)

      for (const layer of layers) {
        if (layer.type === 'symbol') {
          try {
            map.setPaintProperty(layer.id, 'text-halo-color', '#ffffff')
            map.setPaintProperty(layer.id, 'text-halo-width', 2)
            map.setPaintProperty(layer.id, 'text-color', '#1a1a2e')
          } catch { /* skip layers without text */ }
        }
      }

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

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.numberOfApplicationsEurope')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  return (
    <div className="mx-auto my-6 max-w-5xl">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: '#04356C' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>
          {subtitle && (
            <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Card body */}
        <div className="space-y-4 p-6">

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="per-capita-switch" className="text-muted-foreground text-sm select-none">
                {t('statistics.perCapita')}
              </Label>
              <Switch
                id="per-capita-switch"
                checked={perCapita}
                onCheckedChange={setPerCapita}
              />
            </div>

            <Select
              value={effectiveYear?.toString() ?? ''}
              onValueChange={v => setSelectedYear(Number(v))}
              disabled={loading || years.length === 0}
            >
              <SelectTrigger size="sm" className="w-24">
                <SelectValue placeholder={t('statistics.year')} />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="border-border flex items-center overflow-hidden rounded-md border">
              <button
                className={`flex items-center justify-center px-2.5 py-1.5 ${view === 'map' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                title={t('statistics.mapView')}
                onClick={() => setView('map')}
              >
                <MapIcon size={14} />
              </button>
              <button
                className={`border-border flex items-center justify-center border-l px-2.5 py-1.5 ${view === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                title={t('statistics.tableView')}
                onClick={() => setView('table')}
              >
                <LayoutList size={14} />
              </button>
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className={`border-border overflow-hidden rounded-lg border ${view === 'table' ? '' : 'hidden'}`} style={{ height: '480px' }}>
            <IndicatorsDataTable
              data={activeRecords.filter(r => r.country_code !== 'EU27')}
              perCapita={perCapita}
            />
          </div>

          <div className={`border-border flex overflow-hidden rounded-lg border ${view === 'map' ? '' : 'hidden'}`} style={{ height: '480px' }}>
            <div className="bg-muted/30 border-border flex flex-col border-r px-5 pb-5 pt-3" style={{ width: 240, flexShrink: 0 }}>
              <div className="space-y-4">
                {(explanatoryTitle || explanatoryText) && (
                  <div>
                    {explanatoryTitle && (
                      <p className="text-foreground text-sm leading-snug font-bold">
                        {explanatoryTitle}
                      </p>
                    )}
                    {explanatoryText && (
                      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                        {explanatoryText}
                      </p>
                    )}
                  </div>
                )}

                {greeceRecord
                  ? (
                    <div>
                      <p className="text-foreground text-5xl leading-none font-bold tabular-nums">
                        {formatValue(greeceRecord.first_time_applicants, false)}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {t('statistics.firstTimeApplicantsLabel')}
                        {effectiveYear ? ` in ${effectiveYear}` : ''}
                        {' in Greece'}
                      </p>
                    </div>
                  )
                  : (
                    <p className="text-muted-foreground text-sm">—</p>
                  )}
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
              <div ref={containerRef} className="h-full w-full" />
              {loading && (
                <div className="text-muted-foreground absolute inset-0 flex items-center justify-center bg-white/60 text-sm">
                  {t('loadingData')}
                </div>
              )}

              {/* Floating legend */}
              {bucketLabels.length > 0 && (
                <div className="absolute bottom-8 left-3 z-10">
                  <button
                    type="button"
                    onClick={() => setShowLegend(prev => !prev)}
                    className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
                  >
                    <Layers size={12} />
                    {t('statistics.legend')}
                  </button>

                  {showLegend && (
                    <div className="absolute bottom-full mb-2 left-0 min-w-[150px] rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm text-xs">
                      {euRecord && (
                        <p className="text-muted-foreground mb-2 text-[11px]">
                          {t('statistics.euEquals')}
                          {' '}
                          <span className="font-semibold tabular-nums">
                            {formatValue(euRecord[valueKey], perCapita)}
                          </span>
                        </p>
                      )}
                      <p className="text-muted-foreground mb-1.5 text-[10px] font-medium tracking-wide uppercase">
                        {perCapita ? t('statistics.perCapita') : t('statistics.totalApplicantsLegend')}
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
              )}
            </div>
          </div>

        </div>

        {/* Card footer — source & last updated */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-gray-100 bg-gray-50/60 px-6 py-3 text-xs text-gray-500">
            {customText.source && (
              <span>
                <span className="font-medium text-gray-600">
                  {t('statistics.source')}
                  :
                </span>
                {' '}
                <a
                  href={customText.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors hover:text-gray-800"
                >
                  {customText.sourceText || customText.source}
                </a>
              </span>
            )}
            {customText.last_updated_on && (
              <span>
                <span className="font-medium text-gray-600">
                  {t('statistics.lastUpdated')}
                  :
                </span>
                {' '}
                {customText.last_updated_on}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
