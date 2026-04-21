import { useState, useEffect, useRef } from 'react'
import type { yearRegionMapOfMap } from '@/hooks/useAsylumSeekerByRegionOfGreece'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './GreeceRegionMap.css'
import greeceRegionGeoJSONUrl from '@/assets/greece.geojson?url'
import styleUrl from '@/assets/style.json?url'

type year = number | null

export function GreeceMapDetails({ records, loading, error }: { records: yearRegionMapOfMap, loading: boolean, error: string | null }) {
  const { t } = useTranslation()
  const [selectedYear, setSelectedYear] = useState<year>(null)
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const hoverRegionID = useRef<undefined | string | number>(undefined)

  // https://docs.maptiler.com/react/maplibre-gl-js/how-to-use-maplibre-gl-js/
  // https://maplibre.org/maplibre-gl-js/docs/examples/add-a-canvas-source/
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return // stops map from intializing more than once

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      // style: 'https://demotiles.maplibre.org/style.json',
      center: [-117, 32],
      zoom: 0,
    })

    map.on('load', () => {
      map.resize()
      map.addSource('regions', { type: 'geojson', data: greeceRegionGeoJSONUrl })

      map.addLayer({
        id: 'region-border',
        type: 'line',
        source: 'regions',
        paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.85 },
      })
      // https://maplibre.org/maplibre-gl-js/docs/examples/create-a-hover-effect
      map.addLayer({
        id: 'region-fill',
        type: 'fill',
        source: 'regions',
        paint: {
          'fill-color': 'red', 'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.5,
          ],
        },
      })
      // When the user moves their mouse over the state-fill layer, we'll update the
      // feature state for the feature under the mouse.
      map.on('mousemove', 'region-fill', (event) => {
        if (event.features && event.features.length > 0) {
          // deactivate the previous hover if different
          const previousHoverRegionID = hoverRegionID.current
          const newHoverRegionID = event.features[0].id
          if (newHoverRegionID != previousHoverRegionID) {
            hoverRegionID.current = newHoverRegionID
            map.setFeatureState(
              { source: 'regions', id: previousHoverRegionID },
              { hover: false },
            )
            map.setFeatureState(
              { source: 'regions', id: newHoverRegionID },
              { hover: true },
            )
          }// end if
        }// end if
      })
      map.on('mouseleave', 'region-fill', (event) => {
        if (event.features && event.features.length > 0) {
          const leavingRegion = event.features[0].id
          hoverRegionID.current = undefined
          map.setFeatureState(
            { source: 'regions', id: leavingRegion },
            { hover: false },
          )
        }
      })
    })

    mapRef.current = map
  }, [])

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  // { /* ───────── Example of records list item ────────── */ }
  // // asylum_seekers: 1578
  // // region: "Thessaly"
  // // year: 2026

  const yearList = [...records?.keys() ?? []]

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold" style={{ color: '#04356C' }}>
        {/* {t('statistics.asylumEvolutionGreece')} */}
        Number of asylum seekers living in camps
      </h1>

      { /* ──────────────── Year selector ──────────────── */}
      <Select
        value={selectedYear?.toString() ?? ''}
        onValueChange={(selectedValue) => {
          setSelectedYear(Number(selectedValue))
        }}
        disabled={loading || yearList.length === 0}
      >
        <SelectTrigger size="sm" className="w-24">
          <SelectValue placeholder={t('statistics.year')} />
        </SelectTrigger>
        <SelectContent>
          {yearList?.map(y => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      { /* ──────────────── MAP ──────────────── */}
      <div className="map-wrap">
        <div ref={mapContainer} className="map" />
      </div>
    </div>
  )
}
