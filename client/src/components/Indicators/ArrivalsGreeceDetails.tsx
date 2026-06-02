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
import { useTranslation } from 'react-i18next'

const PROTOMAP_KEY = import.meta.env.VITE_PROTOMAP_KEY as string
const NAME_PROP = 'name'

type RegionDef = {
  label: string
  getValue: (y: ArrivalsGreeceYearly) => number
  color: string
}

const REGION_DEFS: Record<string, RegionDef> = {
  'Anatoliki Makedonia kai Thraki': {
    label: 'Evros',
    getValue: y => y.evros,
    color: '#1e3a8a',
  },
  'Voreio Aigaio': {
    label: 'Voreio Aigaio',
    getValue: y => y.lesvos + y.samos + y.chios,
    color: '#3b82f6',
  },
  'Notio Aigaio': {
    label: 'Notio Aigaio',
    getValue: y => y.kos + y.leros + y.other_islands,
    color: '#6366f1',
  },
}

const SEA_ISLANDS: { key: keyof ArrivalsGreeceYearly, label: string, color: string }[] = [
  { key: 'lesvos', label: 'Lesvos', color: '#3b82f6' },
  { key: 'chios', label: 'Chios', color: '#4f8ff7' },
  { key: 'samos', label: 'Samos', color: '#6366f1' },
  { key: 'other_islands', label: 'Other islands', color: '#818cf8' },
  { key: 'kos', label: 'Kos', color: '#a5b4fc' },
  { key: 'leros', label: 'Leros', color: '#c7d2fe' },
]

function applyMapData(map: maplibregl.Map, regionValues: Record<string, number>) {
  const colorExpr: any = [
    'match',
    ['get', NAME_PROP],
    ...Object.entries(regionValues).flatMap(([name]) => [
      name,
      REGION_DEFS[name]?.color ?? '#e5e7eb',
    ]),
    '#e5e7eb',
  ]
  map.setPaintProperty('region-fill', 'fill-color', colorExpr)
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

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const regionValuesRef = useRef<Record<string, number>>({})

  const yearly = useMemo(() => aggregateByYear(records), [records])
  const years = useMemo(() => yearly.map(r => r.year).sort((a, b) => b - a), [yearly])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const effectiveYear = selectedYear ?? years[0] ?? null

  const yearData = useMemo(
    () => (effectiveYear ? yearly.find(r => r.year === effectiveYear) ?? null : null),
    [yearly, effectiveYear],
  )

  const regionValues = useMemo(() => {
    if (!yearData) return {}
    return Object.fromEntries(
      Object.entries(REGION_DEFS)
        .map(([name, def]) => [name, def.getValue(yearData)])
        .filter(([, v]) => (v as number) > 0),
    ) as Record<string, number>
  }, [yearData])

  regionValuesRef.current = regionValues

  const seaRanking = useMemo(() => {
    if (!yearData) return []
    return SEA_ISLANDS
      .map(({ key, label, color }) => ({ label, color, value: yearData[key] as number }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [yearData])

  const evrosValue = yearData?.evros ?? 0
  const maxRankValue = Math.max(...seaRanking.map(d => d.value), evrosValue, 1)

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.arrivalsGreece')
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
      map.addLayer({
        id: 'region-hover',
        type: 'fill',
        source: 'greece',
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 },
      }, firstSymbolId)

      applyMapData(map, regionValuesRef.current)

      map.on('mousemove', 'region-hover', (e) => {
        if (!e.features?.length) return
        map.getCanvas().style.cursor = 'pointer'
        const name = e.features[0].properties?.[NAME_PROP] as string | undefined
        if (!name) return
        const def = REGION_DEFS[name]
        const value = regionValuesRef.current[name]
        if (!def || value == null) return
        popup
          .setHTML(`
            <div style="font-size:12px;font-weight:600;margin-bottom:4px">${def.label}</div>
            <div style="font-size:12px">&#8226; ${value.toLocaleString()}</div>
          `)
          .setLngLat(e.lngLat)
          .addTo(map)
      })

      map.on('mouseleave', 'region-hover', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
      })
    })

    return () => {
      popup.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Re-apply data on year change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => applyMapData(map, regionValues)
    if (map.isStyleLoaded()) apply()
    else {
      map.once('load', apply)
      return () => { map.off('load', apply) }
    }
  }, [regionValues])

  return (
    <div className="mx-auto my-6 max-w-5xl">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: '#04356C' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>
          <select
            className="flex-shrink-0 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
            value={effectiveYear ?? ''}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Card body */}
        <div className="space-y-4 p-6">

          {/* Explanatory text */}
          {(explanatoryTitle || explanatoryText) && (
            <div className="rounded-lg border border-gray-200 p-5">
              {explanatoryTitle && (
                <h3 className="mb-2 text-sm font-bold text-gray-900">{explanatoryTitle}</h3>
              )}
              {explanatoryText && (
                <p className="text-sm leading-relaxed text-gray-600">{explanatoryText}</p>
              )}
            </div>
          )}

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
              <h3 className="mb-4 text-sm font-bold text-gray-900">{t('statistics.rankingLocations')}</h3>

              <h4 className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {t('statistics.seaArrivals')}
              </h4>
              <div className="mb-5 space-y-2.5">
                {seaRanking.map(({ label, color, value }) => (
                  <div key={label}>
                    <span className="text-xs text-gray-700">{label}</span>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="h-5 flex-1 overflow-hidden rounded-sm bg-gray-100">
                        <div
                          className="h-full rounded-sm"
                          style={{ width: `${(value / maxRankValue) * 100}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="w-12 flex-shrink-0 text-right text-xs text-gray-700 tabular-nums">
                        {value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {t('statistics.landArrivals')}
              </h4>
              <div>
                <span className="text-xs text-gray-700">Evros</span>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="h-5 flex-1 overflow-hidden rounded-sm bg-gray-100">
                    <div
                      className="h-full rounded-sm bg-blue-900"
                      style={{ width: `${(evrosValue / maxRankValue) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 flex-shrink-0 text-right text-xs text-gray-700 tabular-nums">
                    {evrosValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card footer */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="flex justify-between border-t border-gray-100 bg-gray-50/60 px-6 py-3 text-xs text-gray-500">
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
                    {customText.sourceText || customText.source}
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
        )}
      </div>
    </div>
  )
}
