import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { AsylumSeekersCampsRecord } from '@/hooks/useAsylumSeekersCamps'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { ChartContainer, ChartTooltipContent, ChartLegendContent, IndicatorInfoButton } from '@/components/ui'
import type { ChartConfig } from '@/components/ui'
import { useTranslation } from 'react-i18next'

const REGION_COLORS = [
  '#04356C', '#1E6FA5', '#3F9FD8', '#6BB8E8', '#9AD0F2', '#C5E5F8',
  '#7C3AED', '#A78BFA', '#B45309', '#D97706', '#065F46', '#059669',
]
const CAMP_COLORS = [
  '#0000b8', '#0170b9', '#0090ff', '#d5d5d5'
]
const CAMP_TYPES = [
  "CCAC",
  "RIC",
  "Sites",
  "ESTIA"
]

// Camp types are specified in a string with additional data,
// but the camp type is always the first word in the string.
// So we split on spaces and take the first word as the camp type.
function isCampType(record: AsylumSeekersCampsRecord, campType: string): boolean {
  let type = record.area.split(' ')[0];
  return type.toLowerCase().includes(campType.toLowerCase())
}

export function AsylumSeekersCampsDetails({
  records,
  loading,
  error,
  customText,
}: {
  records: AsylumSeekersCampsRecord[]
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  console.log(records);

  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'

  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [selectedCampType, setSelectedCampType] = useState<string>('all')
  const [byRegion, setByRegion] = useState(true)

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

  // Group by year-month, then by region/camp type — one series per region/camp type
  const chartData = useMemo(() => {
    const filtered = records.filter(r => {
      return (selectedRegion == 'all' || r.region === selectedRegion)
        &&
        (selectedCampType == 'all' || isCampType(r, selectedCampType))
    })

    // Aggregate by date
    const map = new Map<string, Record<string, number>>()
    for (const r of filtered) {
      const key = r.date.slice(0, 7) // YYYY-MM
      const entry = map.get(key) ?? {}

      // Because some records are labeled as multiple camp types,
      // we have to treat records as potentially belonging to multiple groups.
      // However, records always belong to only one region.
      let groups = byRegion ? [r.region] : (campTypes.get(r.id) || []);
      for (const group of groups) {
        entry[group] = (entry[group] ?? 0) + r.asylum_seekers
      }

      map.set(key, entry)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }))
  }, [records, selectedRegion, selectedCampType, byRegion])

  // Line label/key and color information.
  const chartLines = useMemo(() => {
    if (byRegion) {
      const groups = selectedRegion === 'all' ? regions : [selectedRegion];
      return groups.map((region, i) => ({
        label: region,
        color: REGION_COLORS[i % REGION_COLORS.length],
      }))
    } else {
      const groups = selectedCampType === 'all' ? CAMP_TYPES : [selectedCampType];
      return groups.map((campType, i) => ({
        label: campType,
        color: CAMP_COLORS[i % CAMP_COLORS.length],
      }))
    }
  }, [regions, selectedRegion, selectedCampType, byRegion])

  const chartConfig = useMemo(() => {
    return Object.fromEntries(
      chartLines.map(meta => [meta.label, meta]),
    ) as ChartConfig
  }, [chartLines])

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
              value={byRegion.toString()}
              onChange={e => {
                const value = e.target.value;
                setByRegion(value === 'true');
              }}
            >
              <option value="true">{t('statistics.byRegion')}</option>
              <option value="false">{t('statistics.byTypeOfCamp')}</option>
            </select>

            <select
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm"
              value={selectedCampType}
              onChange={e => setSelectedCampType(e.target.value)}
            >
              <option value="all">{t('statistics.allTypes')}</option>
              {CAMP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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

            {/* TODO */}
            {/* {mostRecentData && ( */}
            {/*   <div className="rounded-lg border border-gray-200 p-5"> */}
            {/*     {subtitle && ( */}
            {/*       <p className="text-sm font-bold text-gray-900 mb-4">{subtitle}</p> */}
            {/*     )} */}
            {/*     <p className="text-6xl font-bold text-gray-900 leading-none tabular-nums"> */}
            {/*       {mostRecentData.first_time_applicants} */}
            {/*     </p> */}
            {/*     <p className="text-sm text-gray-600 mt-2"> */}
            {/*       {t('statistics.firstTimeApplicantsLabel')} in {mostRecentData.year} */}
            {/*     </p> */}
            {/*   </div> */}
            {/* )} */}
          </div>

          {/* Line chart */}
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={d => d.slice(0, 7)} />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              {chartLines.map(meta => (
                <Line
                  key={meta.label}
                  type="monotone"
                  dataKey={meta.label}
                  stroke={meta.color}
                  dot={false}
                />
              ))}
            </LineChart>
          </ChartContainer>

        </div>

        {/* Card footer */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs text-gray-500">
            {customText.source && (
              <span>
                <span className="font-medium text-gray-600">{t('statistics.source')}:</span>
                {' '}
                <a href={customText.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800 transition-colors">
                  {customText.sourceText || customText.source}
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
        )}
      </div>
    </div>
  )
}
