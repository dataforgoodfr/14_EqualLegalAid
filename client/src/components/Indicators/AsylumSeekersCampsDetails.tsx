import { useMemo, useState, useRef, useEffect } from 'react'
import { BarChart, Bar, Cell, LabelList, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BarChart2, LineChart as LineChartIcon, RotateCcw, Play, Pause } from 'lucide-react'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { AsylumCampRecord, AsylumSeekersCampsRecord } from '@/hooks/useAsylumSeekersCamps'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { ChartContainer, ChartTooltipContent, IndicatorInfoButton, CHART_GRID_PROPS } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import maplibregl, { type ExpressionSpecification } from 'maplibre-gl'
import grUrl from '@/assets/gr.json?url'
import layersFn from 'protomaps-themes-base'
import 'maplibre-gl/dist/maplibre-gl.css'

const PROTOMAP_KEY = import.meta.env.VITE_PROTOMAP_KEY as string

const REGION_COLORS = [
  '#003366', '#1E6FA5', '#3F9FD8', '#6BB8E8', '#9AD0F2', '#C5E5F8',
  '#7C3AED', '#A78BFA', '#B45309', '#D97706', '#065F46', '#059669',
]
const CAMP_TYPES = [
  "CCAC",
  "RIC",
  "Site",
  "ESTIA",
] as const
const CAMP_COLORS: Record<string, string> = {
  'CCAC': '#003366',
  'RIC': '#d97706',
  'Site': '#0090ff',
  'ESTIA': '#7C3AED',
}
// Display-only label override — keeps the underlying "Site" data key intact
// (it's what Airtable and the filter logic use) while showing nicer copy.
const CAMP_TYPE_LABELS: Record<string, string> = {
  'Site': 'Facilities',
}

// Découpage géographique large porté par la colonne `area`. Ordre fixé ici plutôt
// qu'alphabétique pour que l'empilement aille du plus gros au plus petit.
const AREA_ORDER = ['Southern Greece', 'Northern Greece', 'Aegean Islands', 'Crete']
// Teintes distinctes et non un dégradé de bleus : un dégradé de clarté code une
// grandeur ORDONNÉE, or les zones sont des catégories nominales. Trois bleus
// voisins rendaient les courbes indiscernables dès qu'elles se croisaient.
// Marine et orange sont ceux de la marque ; le vert et le violet viennent de la
// palette Okabe-Ito, qui reste lisible avec un daltinisme deutan ou protan.
const AREA_COLORS: Record<string, string> = {
  'Southern Greece': '#003366',
  'Northern Greece': '#D15F36',
  'Aegean Islands': '#009E73',
  'Crete': '#CC79A7',
}

// Renfort non chromatique : à quatre courbes qui se croisent, la couleur seule
// échoue en impression noir et blanc comme pour une partie des daltoniens.
const AREA_DASH: Record<string, string | undefined> = {
  'Southern Greece': undefined,
  'Northern Greece': '6 3',
  'Aegean Islands': '2 3',
  'Crete': '8 3 2 3',
}

// La colonne `region` d'Airtable est en anglais, le GeoJSON porte des
// translittérations du grec. Les 11 régions présentes en base sont toutes
// couvertes ; les trois autres n'accueillent aucun camp mais restent listées
// pour ne pas avoir à y revenir si ça change.
const REGION_GEO_NAME: Record<string, string> = {
  'Attica': 'Attiki',
  'Central Macedonia': 'Kentriki Makedonia',
  'Eastern Macedonia and Thrace': 'Anatoliki Makedonia kai Thraki',
  'Central Greece': 'Stereá Elláda',
  'Crete': 'Kriti',
  'Epirus': 'Ipeiros',
  'North Aegean': 'Voreio Aigaio',
  'South Aegean': 'Notio Aigaio',
  'Peloponnese': 'Peloponnisos',
  'Thessaly': 'Thessalia',
  'Western Greece': 'Dytiki Ellada',
  'Western Macedonia': 'Dytiki Makedonia',
  'Ionian Islands': 'Ionioi Nisoi',
}

// Gamme d'ardoise et non de bleus : les quatre couleurs de type de camp occupent
// déjà le bleu, le marine, l'ambre et le violet. Un aplat coloré sous les points
// les rendrait illisibles — le choropleth est le fond, les points le sujet.
const REGION_SCALE_COLORS = ['#f1f5f9', '#dde3ea', '#c2cbd6', '#9aa7b7', '#6b7c91']
const REGION_THRESHOLDS = [500, 1500, 3000, 5000]
const REGION_NO_DATA_COLOR = '#fafafa'

function regionBucketColor(value: number): string {
  for (let i = 0; i < REGION_THRESHOLDS.length; i++) {
    if (value <= REGION_THRESHOLDS[i]) return REGION_SCALE_COLORS[i]
  }
  return REGION_SCALE_COLORS[REGION_SCALE_COLORS.length - 1]
}

// Une ligne du graphique d'évolution. La signature d'index couvre les colonnes
// d'aires, ajoutées dynamiquement d'après les valeurs présentes en base.
interface AreaRow {
  [area: string]: number | string | null
  key: string
  total: number
}

// Une ligne peut couvrir plusieurs camps, sous trois formes rencontrées en base :
// « Elefsina, Schisto », « Drama and Kavala », « Islands (Lesvos, Samos, Chios) ».
// Les parenthèses portent la liste réelle, le préfixe n'est qu'un intitulé.
// Sans ce découpage, 6 des 31 camps de la carte n'étaient rattachés à aucune région
// et disparaissaient dès qu'un filtre régional était appliqué.
function campNamesFromLocation(location: string): string[] {
  const inParens = /\(([^)]*)\)/.exec(location)
  const source = inParens ? inParens[1] : location
  return source.split(/,| and /).map(n => n.trim()).filter(Boolean)
}

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

// "2025-06" -> "June 2025", pour l'infobulle de la courbe mensuelle.
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
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [evolutionStep, setEvolutionStep] = useState<'month' | 'year'>('month')

  const filtersActive = selectedRegion !== 'all' || selectedCampType !== 'all' || selectedMonthIndex !== null
  const resetFilters = () => {
    setSelectedRegion('all')
    setSelectedCampType('all')
    setSelectedMonthIndex(null)
    setPlaying(false)
  }

  // Collect all region names based on the data records.
  const regions = useMemo(() => {
    const set = new Set<string>()
    for (const r of records) if (r.region) set.add(r.region)
    return Array.from(set).sort()
  }, [records])

  // Cache a lookup of record ids to their camp types.
  // Some camps are labeled as multiple types, in particular "CCAC/RIC".
  const campTypes = useMemo(() => {
    const types = new Map<string, string[]>()
    for (const r of records) {
      types.set(r.id, CAMP_TYPES.filter(t => isCampType(r, t)));
    }
    return types
  }, [records])

  // Liste ordonnée des mois disponibles — c'est l'axe du curseur.
  const months = useMemo(() => {
    const set = new Set<string>()
    for (const r of records) {
      if (!r.year || !r.month) continue
      set.add(`${r.year}-${String(r.month).padStart(2, '0')}`)
    }
    return Array.from(set).sort()
  }, [records])

  const lastMonthIndex = Math.max(months.length - 1, 0)
  const monthIndex = selectedMonthIndex ?? lastMonthIndex
  const effectiveMonth = months[monthIndex] ?? ''

  // Nombre de mois renseignés par année — sert au seul agrégat annuel du graphique
  // d'évolution. L'indicateur mesure un STOCK (personnes hébergées à un instant
  // donné) : additionner douze mois compterait douze fois la même personne, c'est
  // la moyenne mensuelle qui fait sens. Le diviseur suit les données, donc 2026
  // (6 mois) reste comparable à une année pleine.
  const monthsPerYear = useMemo(() => {
    const map = new Map<number, Set<number>>()
    for (const r of records) {
      if (!r.year || !r.month) continue
      if (!map.has(r.year)) map.set(r.year, new Set())
      map.get(r.year)!.add(r.month)
    }
    return new Map(Array.from(map, ([y, ms]) => [y, ms.size]))
  }, [records])

  // Records du mois sélectionné. Aucune moyenne ici : au pas mensuel la valeur EST
  // le nombre de personnes hébergées ce mois-là.
  const snapshotRecords = useMemo(() => {
    return records.filter(r => {
      return `${r.year}-${String(r.month).padStart(2, '0')}` === effectiveMonth
        && (selectedRegion === 'all' || r.region === selectedRegion)
        && (selectedCampType === 'all' || isCampType(r, selectedCampType))
    })
  }, [records, effectiveMonth, selectedRegion, selectedCampType])

  // Lecture automatique : un pas par 450 ms, retour au début en fin de série.
  useEffect(() => {
    if (!playing || months.length < 2) return
    const id = setInterval(() => {
      setSelectedMonthIndex(prev => ((prev ?? lastMonthIndex) + 1) % months.length)
    }, 450)
    return () => clearInterval(id)
  }, [playing, months.length, lastMonthIndex])

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
      total: snapshotRecords.reduce((acc, r) => acc + r.asylum_seekers, 0),
      month: effectiveMonth,
    }
  }, [snapshotRecords, effectiveMonth])

  // Looks up which region a named location belongs to, so the map (which only has
  // name/type/coordinates, no region) can be filtered by the region select too.
  // Note : `area` porte le découpage large (Southern Greece, Aegean Islands…), les
  // noms de camps sont dans `location` — parfois plusieurs séparés par des virgules
  // quand une ligne couvre plusieurs camps. C'est donc `location` qu'on découpe.
  const nameToRegion = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of records) {
      if (!r.location || !r.region) continue
      for (const name of campNamesFromLocation(r.location)) {
        if (!map.has(name)) map.set(name, r.region)
      }
    }
    return map
  }, [records])

  // The map points, filtered to match the currently selected camp type / region —
  // previously the map always showed every location regardless of the filters.
  const visibleLocations = useMemo(() => {
    return locations.filter(loc => {
      if (selectedCampType !== 'all' && !isCampType(loc, selectedCampType)) return false
      if (selectedRegion !== 'all' && nameToRegion.get(loc.name) !== selectedRegion) return false
      return true
    })
  }, [locations, selectedCampType, selectedRegion, nameToRegion])

  // Évolution mensuelle par zone géographique, sur toute la période et
  // indépendamment des filtres du haut — ceux-ci portent sur un mois donné.
  const areaSeries = useMemo(() => {
    const present = new Set(records.map(r => r.area).filter(Boolean))
    return [
      ...AREA_ORDER.filter(a => present.has(a)),
      ...[...present].filter(a => !AREA_ORDER.includes(a)).sort(),
    ]
  }, [records])

  // Effectifs mensuels par zone, sur toute la période. Au pas mensuel les valeurs
  // sont directement le nombre de personnes hébergées ce mois-là : aucune moyenne
  // à faire, contrairement à l'agrégat annuel du sélecteur ci-dessus.
  const areaEvolution = useMemo(() => {
    const map = new Map<string, AreaRow>()
    for (const r of records) {
      if (!r.year || !r.month || !r.area) continue
      const key = `${r.year}-${String(r.month).padStart(2, '0')}`
      let row = map.get(key)
      if (!row) {
        row = { key, total: 0 }
        map.set(key, row)
      }
      row[r.area] = ((row[r.area] as number) ?? 0) + r.asylum_seekers
      row.total += r.asylum_seekers
    }
    // Airtable garde des lignes à 0 longtemps après la fermeture d'une zone — la
    // Crète en a 38, de décembre 2022 à janvier 2026. Tracées, elles donnent une
    // courbe plate collée à l'axe, qui se lit comme une donnée alors que c'est une
    // absence. `null` fait rompre la courbe au lieu de la poser à zéro.
    const rows = Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key))
    for (const row of rows) {
      for (const [k, v] of Object.entries(row)) {
        if (k !== 'key' && k !== 'total' && v === 0) row[k] = null
      }
    }
    return rows
  }, [records])

  // Même série au pas annuel. Ici la moyenne mensuelle est obligatoire : additionner
  // les douze mois donnerait des « personnes-mois », et 2026 (6 mois) paraîtrait
  // deux fois plus basse qu'une année pleine.
  const areaYearly = useMemo(() => {
    const sums = new Map<number, Map<string, number>>()
    for (const r of records) {
      if (!r.year || !r.area) continue
      if (!sums.has(r.year)) sums.set(r.year, new Map())
      const byArea = sums.get(r.year)!
      byArea.set(r.area, (byArea.get(r.area) ?? 0) + r.asylum_seekers)
    }
    return Array.from(sums.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, byArea]) => {
        const months = monthsPerYear.get(year) || 1
        const row: AreaRow = { key: String(year), total: 0 }
        for (const [area, sum] of byArea) {
          const avg = Math.round(sum / months)
          row[area] = avg
          row.total += avg
        }
        return row
      })
  }, [records, monthsPerYear])

  // Effectif par région pour l'année choisie — moyenne mensuelle, comme le key
  // figure. Suit les filtres type et région, pour rester cohérent avec les points.
  const regionFillExpression = useMemo(() => {
    const totals = new Map<string, number>()
    for (const r of snapshotRecords) {
      if (!r.region) continue
      totals.set(r.region, (totals.get(r.region) ?? 0) + r.asylum_seekers)
    }
    const pairs: string[] = []
    for (const [region, sum] of totals) {
      const geoName = REGION_GEO_NAME[region]
      if (!geoName) continue
      pairs.push(geoName, regionBucketColor(sum))
    }
    // `match` exige au moins un couple étiquette/valeur.
    if (!pairs.length) return REGION_NO_DATA_COLOR as unknown as ExpressionSpecification
    return ['match', ['get', 'name'], ...pairs, REGION_NO_DATA_COLOR] as unknown as ExpressionSpecification
  }, [snapshotRecords])

  const visibleLocationsRef = useRef<AsylumCampRecord[]>([])
  visibleLocationsRef.current = visibleLocations
  const regionFillRef = useRef<ExpressionSpecification>(regionFillExpression)
  regionFillRef.current = regionFillExpression
  const mapLoadedRef = useRef(false)

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
      map.addSource('regions-source', { type: 'geojson', data: grUrl })
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

      // Régions d'abord, points ensuite : insérés au même endroit de la pile, le
      // dernier ajouté se retrouve au-dessus. Les points doivent rester lisibles.
      map.addLayer({
        id: 'regions-fill',
        type: 'fill',
        source: 'regions-source',
        paint: {
          'fill-color': regionFillRef.current,
          'fill-opacity': 0.75,
        },
      }, firstSymbolId)
      map.addLayer({
        id: 'regions-border',
        type: 'line',
        source: 'regions-source',
        paint: { 'line-color': '#ffffff', 'line-width': 0.8, 'line-opacity': 0.9 },
      }, firstSymbolId)

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

      mapLoadedRef.current = true

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
      mapLoadedRef.current = false
      popup.remove()
      map.remove()
      mapRef.current = null
    }
  }, [locations])

  // Re-apply the point source whenever the camp-type/region filters change.
  // Avant `load`, le handler de load applique lui-même les refs à jour — attendre
  // `once('load')` ici bloquerait, l'événement ayant pu être déjà émis.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return
    const source = map.getSource('points-source') as maplibregl.GeoJSONSource | undefined
    source?.setData(convertToGeoJSON(visibleLocations))
  }, [visibleLocations])

  // Recolore les régions quand l'année ou les filtres changent.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return
    map.setPaintProperty('regions-fill', 'fill-color', regionFillExpression)
  }, [regionFillExpression])

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.asylumSeekersCamps')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />
  if (records.length === 0) return <p className="text-muted-foreground text-sm p-6">{t('statistics.noData')}</p>

  return (
    <div className="mx-auto my-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold whitespace-pre-line" style={{ color: '#003366' }}>{title}</h2>
              <IndicatorInfoButton text={information} />
            </div>
            {/* whitespace-pre-line : les sauts de ligne saisis dans Airtable sont
                sinon écrasés en simple espace par le rendu HTML. */}
            {subtitle && <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">{subtitle}</p>}
          </div>

          <div className="flex gap-2">
            {/* Curseur temporel + lecture. Un menu déroulant de 54 mois serait
                pénible ; le balayage rend l'évolution lisible d'un geste. */}
            {months.length > 1 && (
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPlaying(p => !p)}
                  title={playing ? t('statistics.pause') : t('statistics.play')}
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={lastMonthIndex}
                  step={1}
                  value={monthIndex}
                  onChange={(e) => {
                    setPlaying(false)
                    setSelectedMonthIndex(Number(e.target.value))
                  }}
                  className="w-40 accent-[#003366]"
                  aria-label={t('statistics.year')}
                />
                <span className="w-24 flex-shrink-0 text-xs tabular-nums text-gray-700">
                  {formatYearMonth(effectiveMonth)}
                </span>
              </div>
            )}

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

            {/* Désactivé tant que rien n'est filtré : un bouton toujours actif
                laisserait croire qu'il reste quelque chose à remettre à zéro. */}
            <button
              type="button"
              onClick={resetFilters}
              disabled={!filtersActive}
              title={t('statistics.resetFilters')}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <RotateCcw size={12} />
              {t('statistics.resetFilters')}
            </button>
          </div>
        </div>

        {/* Card body */}
        <div className="space-y-6 p-6">

          <div className="grid grid-cols-[2fr_1fr] gap-4">
            {(explanatoryTitle || explanatoryText) && (
              <div className="rounded-lg border border-gray-200 p-5">
                {explanatoryTitle && (
                  <h3 className="text-sm font-bold text-gray-900 mb-3 whitespace-pre-line">{explanatoryTitle}</h3>
                )}
                {explanatoryText && (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{explanatoryText}</p>
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
                  {formatYearMonth(keyFigure.month)}
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

              {/* Key — deux couches distinctes : les points portent le type de camp,
                  l'aplat des régions l'effectif hébergé. */}
              <div className="absolute bottom-5 left-5 z-10 rounded-[4px] bg-white/95 p-2.5 text-xs">
                {Object.entries(CAMP_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center mb-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: color }}
                    />
                    {CAMP_TYPE_LABELS[type] ?? type}
                  </div>
                ))}

                <div className="mt-2 border-t border-gray-200 pt-2">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                    {t('statistics.byRegion')}
                  </p>
                  <div className="flex items-center gap-1">
                    {REGION_SCALE_COLORS.map(c => (
                      <span
                        key={c}
                        className="inline-block h-3 w-5 border border-white"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="mt-0.5 flex justify-between text-[9px] tabular-nums text-gray-500">
                    <span>0</span>
                    <span>{`> ${REGION_THRESHOLDS[REGION_THRESHOLDS.length - 1].toLocaleString('fr-FR')}`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar chart — snapshot for the selected month */}
            <div className="w-64 flex-1 min-w-0 overflow-y-auto rounded-lg border border-gray-200 p-4">
              {/* Toutes les combinaisons filtre/mois ne portent pas de donnée — la
                  Crète s'arrête en janvier 2026, Attica n'a pas de CCAC. Sans ce
                  message, le graphique se vidait sans rien dire. */}
              {snapshotData.length === 0 && (
                <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
                  {t('statistics.noData')}
                </p>
              )}
              <ChartContainer config={{}} className={`h-80 w-full ${snapshotData.length === 0 ? 'hidden' : ''}`}>
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

          {/* Évolution par zone — la carte et l'histogramme ci-dessus portent sur
              un mois, celui-ci sur toute la période. */}
          {areaEvolution.length > 1 && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-gray-900">
                  {t('statistics.evolutionResidingInCamps')}
                  {evolutionStep === 'year' && (
                    <span className="ml-2 font-normal text-gray-500">
                      {t('statistics.monthlyAverageSuffix')}
                    </span>
                  )}
                </h3>
                <div className="border-border flex flex-shrink-0 items-center overflow-hidden rounded-md border">
                  <button
                    type="button"
                    className={`flex items-center justify-center px-2.5 py-1.5 ${evolutionStep === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                    title={t('statistics.byMonth')}
                    onClick={() => setEvolutionStep('month')}
                  >
                    <LineChartIcon size={14} />
                  </button>
                  <button
                    type="button"
                    className={`border-border flex items-center justify-center border-l px-2.5 py-1.5 ${evolutionStep === 'year' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                    title={t('statistics.byYear')}
                    onClick={() => setEvolutionStep('year')}
                  >
                    <BarChart2 size={14} />
                  </button>
                </div>
              </div>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {evolutionStep === 'month'
                    ? (
                      <LineChart data={areaEvolution} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                        <CartesianGrid {...CHART_GRID_PROPS} />
                        {/* Un repère par an : 54 mois d'étiquettes seraient illisibles. */}
                        <XAxis
                          dataKey="key"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11 }}
                          interval={0}
                          tickFormatter={k => k.endsWith('-01') ? k.slice(0, 4) : ''}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11 }}
                          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                        />
                        <Tooltip
                          formatter={(value, name) => [Number(value).toLocaleString('fr-FR'), name]}
                          labelFormatter={label => formatYearMonth(String(label))}
                        />
                        <Legend iconType="line" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        {/* Courbes non empilées : on compare les zones entre elles, et
                            un empilement ferait lire chaque zone depuis une base mouvante. */}
                        {areaSeries.map(area => (
                          <Line
                            key={area}
                            type="monotone"
                            dataKey={area}
                            name={area}
                            stroke={AREA_COLORS[area] ?? '#94a3b8'}
                            strokeDasharray={AREA_DASH[area]}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    )
                    : (
                      // Empilé, contrairement aux courbes : les zones sont disjointes,
                      // leur somme est donc le total hébergé — information que la vue
                      // mensuelle ne donne pas.
                      <BarChart data={areaYearly} margin={{ top: 20, right: 16, left: 16, bottom: 8 }}>
                        <CartesianGrid {...CHART_GRID_PROPS} />
                        <XAxis dataKey="key" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11 }}
                          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                        />
                        <Tooltip
                          formatter={(value, name) => [Number(value).toLocaleString('fr-FR'), name]}
                          labelFormatter={label => t('statistics.yearLabel', { year: label })}
                          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        />
                        <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        {areaSeries.map((area, i) => {
                          const isTop = i === areaSeries.length - 1
                          return (
                            <Bar
                              key={area}
                              dataKey={area}
                              name={area}
                              stackId="areas"
                              fill={AREA_COLORS[area] ?? '#94a3b8'}
                              radius={isTop ? [3, 3, 0, 0] : undefined}
                            >
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
                    )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

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
              <p className="italic text-gray-400 whitespace-pre-line">{customText.sourceText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
