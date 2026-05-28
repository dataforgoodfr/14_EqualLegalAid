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

const DEFAULT_COLOUR = 'white'
// 5-step ELA blues
const BUCKET_COLORS = ['#bfdbfe', '#7db9f5', '#3b82f6', '#1d56c4', '#1e3a8a']

// Fixed thresholds — independent of data
const THRESHOLDS = [50, 100, 1_000, 5000]

function getBucketColor(value: number, thresholds: number[]): string {
  if (!thresholds.length) return BUCKET_COLORS[0]
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) return BUCKET_COLORS[i]
  }
  return BUCKET_COLORS[BUCKET_COLORS.length - 1]
}

function dataBasedColour(selectedYear: year, records: yearRegionMapOfMap) {
  // return a colour which depends on the name of the current data

  // prepare the argument of maplibregl MATCH function
  // string containing pairs of keys and values, if the key of the current data matches one of the key, we will use the corresponding valueprepare a
  if (!selectedYear) return DEFAULT_COLOUR
  const regionMap = records?.get(selectedYear)
  if (!regionMap) return DEFAULT_COLOUR

  const regionColourList: string[] = []

  for (const record of regionMap) {
    const region: string = record[0]
    const data: number = record[1]
    const colour = getBucketColor(data, THRESHOLDS)
    regionColourList.push(region)
    regionColourList.push(colour)
  }

  console.log({ regionColourList })

  return [
    'match',
    ['get', 'name'],

    // ...['Thessalia', 'red', 'Stereá Elláda', 'green'],
    ...regionColourList,
    // default value
    DEFAULT_COLOUR,
  ]
}

export function GreeceMapDetails({ records, loading, error }: { records: yearRegionMapOfMap, loading: boolean, error: string | null }) {
  const { t } = useTranslation()
  const [selectedYear, setSelectedYear] = useState<year>(null)
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const hoverRegionID = useRef<undefined | string | number>(undefined)

  // https://docs.maptiler.com/react/maplibre-gl-js/how-to-use-maplibre-gl-js/
  // https://maplibre.org/maplibre-gl-js/docs/examples/add-a-canvas-source/
  useEffect(() => {
    if (!mapContainer.current) {
      console.log('mapContainer is not ready yet')
      return
    }
    else {
      if (mapRef.current) {
        console.log('mapRef already defined')
        return
      }
      else {
        console.log('allright, we enter the useEffect')
        const map = new maplibregl.Map({
          container: mapContainer.current,
          style: styleUrl,
          // style: 'https://demotiles.maplibre.org/style.json',
          center: [-117, 32],
          zoom: 0,
          // maxBounds:[
          //   [-1000, 1000], // Southwest coordinates
          //   [-1000, 1000] // Northeast coordinates
          // ]
        })

        map.on('load', () => {
          console.log('map loaded')
          map.resize()
          map.addSource('regions', { type: 'geojson', data: greeceRegionGeoJSONUrl })

          map.addLayer({
            id: 'region-border',
            type: 'line',
            source: 'regions',
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.85 },
          })
          // the opacity of the color will depend if the mouse is hover a region or not
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
                if (previousHoverRegionID != undefined) {
                  map.setFeatureState(
                    { source: 'regions', id: previousHoverRegionID },
                    { hover: false },
                  )
                }
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
      }
    }
  }, [loading])

  // ── Re-apply whenever year changes ───────────────────────
  useEffect(() => {
    const dataBasedColourMapping = dataBasedColour(selectedYear, records)
    console.log({ dataBasedColourMapping })

    const map = mapRef.current
    if (!map) return
    const apply = () => {
      // the opacity of the color will depend of the number of people in this region in a certain year
      // https://maplibre.org/maplibre-style-spec/expressions/
      map.setPaintProperty('region-fill', 'fill-color', dataBasedColourMapping)
    }
    if (map.isStyleLoaded()) {
      apply()
    }
    else {
      // Map not ready yet — apply as soon as it is
      map.once('load', apply)
      return () => { map.off('load', apply) }
    }
  }, [selectedYear, records])

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
        {loading && (
          <div className="text-muted-foreground absolute inset-0 flex items-center justify-center bg-white/60 text-sm">
            {t('loadingData')}
          </div>
        )}
      </div>
    </div>
  )
}
