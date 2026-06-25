import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import type { AsylumApplicationByGenderAgeRecord, AsylumApplicationByNationalityRecord, AsylumApplicationRecords } from '@/hooks/useGreeceTotalApplications'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import {
  ChartContainer,
  ChartLegendContent,
  StatCard,
  ChartTooltipContent,
  IndicatorInfoButton,
} from '@/components/ui'
import type { ChartConfig } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'

type ByOption = 'byPeriod' | 'byGenderAge' | 'byNationality'

const COLORS = [
  '#04356C', '#1E6FA5', '#3F9FD8', '#6BB8E8', '#9AD0F2', '#C5E5F8',
  '#7C3AED', '#A78BFA', '#B45309', '#D97706', '#065F46', '#059669',
]

// Aggregate an array of records such that there is only
// one record per year, over one or more pivot keys.
//
// This turns e.g.
//
//     [
//       {year: 2000, value: 10, country: 'US'},
//       {year: 2000, value: 20, country: 'UK'},
//       {year: 2000, value:  5, country: 'UK'},
//     ]
//
// into
//
//     [
//       {year: 2000, US: 10, UK: 25},
//     ]
function aggregateRecords(
  data: any[],
  valueKey: string,
  pivotKeys: string[]
): any[] {
  const grouped: Record<number, any> = {};
  for (const record of data) {
    const year = record.year;
    const value = Number(record[valueKey]) || 0;

    // Initialize year entry if needed
    if (!grouped[year]) {
      grouped[year] = { year };
    }

    for (const key of pivotKeys) {
      const keyValue = record[key];

      if (keyValue) {
        // Sum if key already exists
        grouped[year][keyValue] = (grouped[year][keyValue] || 0) + value;
      }
    }
  }
  return Object.values(grouped);
}

// Creates a chart config from an array of records
// and one or more pivot keys.
//
// This turns e.g.
//
//     [
//       {year: 2000, value: 10, country: 'US'},
//       {year: 2000, value: 20, country: 'UK'},
//       {year: 2000, value:  5, country: 'UK'},
//     ]
//
// into
//
//     {
//       US: {
//         label: "US",
//         color: "#ff0000",
//       },
//       UK: {
//         label: "UK",
//         color: "#00ff00",
//       }
//     }
function generateChartConfig(
  data: any[],
  pivotKeys: string[],
): ChartConfig {
  const uniqueValues = new Set<string>();

  for (const record of data) {
    for (const key of pivotKeys) {
      const value = record[key];
      if (value) {
        uniqueValues.add(String(value));
      }
    }
  }

  const configMap: ChartConfig = {};
  Array.from(uniqueValues).forEach((label, index) => {
    const color = COLORS[index % COLORS.length];
    configMap[label] = { label, color };
  });
  return configMap;
}



function ByPeriod({
  records,
}: {
  records: AsylumApplicationRecord[]
}) {
  const { t } = useTranslation()
  const chartConfig = {
    first_time_applicants: {
      label: t('statistics.firstTime'),
      color: '#04356C',
    },
    subsequent_applicants: {
      label: t('statistics.subsequent'),
      color: '#6B9BD2',
    },
  } satisfies ChartConfig

  if (records.length === 0) return <p className="text-muted-foreground text-sm p-6">{t('statistics.noData')}</p>

  let totalFirstTime = 0
  let totalSubSequent = 0
  for (const record of records) {
    totalFirstTime += record.first_time_applicants
    totalSubSequent += record.subsequent_applicants
  }
  const firstYear = records[0].year
  const lastYear = records[records.length - 1].year

  return (
    <div className="space-y-6 p-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label={t('statistics.totalFirstTime', { start: firstYear, end: lastYear })}
          value={totalFirstTime.toLocaleString()}
        />
        <StatCard
          label={t('statistics.totalSubsequent', { start: firstYear, end: lastYear })}
          value={totalSubSequent.toLocaleString()}
        />
      </div>

      {/* Line chart */}
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <LineChart width={500} height={300} data={records}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip
            content={(
              <ChartTooltipContent
                labelFormatter={label => t('statistics.yearLabel', { year: label })}
              />
            )}
          />
          <Legend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="first_time_applicants" stroke={chartConfig.first_time_applicants.color} />
          <Line type="monotone" dataKey="subsequent_applicants" stroke={chartConfig.subsequent_applicants.color} />
        </LineChart>
      </ChartContainer>
    </div>
  )
}

function ByNationality({
  records,
}: {
  records: AsylumApplicationByNationalityRecord[]
}) {
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    return {
      config: generateChartConfig(records, ["country"]),
      records: aggregateRecords(records, "total_applications", ["country"]),
    }
  }, [records])

  if (records.length === 0) return <p className="text-muted-foreground text-sm p-6">{t('statistics.noData')}</p>

  return (
    <div className="space-y-6 p-6">
      {/* Line chart */}
      <ChartContainer config={chartData.config} className="h-80 w-full">
        <LineChart width={500} height={300} data={chartData.records}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip
            wrapperStyle={{ zIndex: 1000 }}
            content={(
              <ChartTooltipContent
                labelFormatter={label => t('statistics.yearLabel', { year: label })}
                multiColumn
              />
            )}
          />
          <Legend content={<ChartLegendContent />} />
          {Object.entries(chartData.config).map(([key, config]) => (
            <Line key={key} type="monotone" dataKey={key} stroke={config.color} />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}

function ByGenderAge({
  records,
}: {
  records: AsylumApplicationByGenderAgeRecord[]
}) {
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    return {
      config: generateChartConfig(records, ["gender", "age"]),
      records: aggregateRecords(records, "applications", ["gender", "age"]),
    }
  }, [records])

  if (records.length === 0) return <p className="text-muted-foreground text-sm p-6">{t('statistics.noData')}</p>

  return (
    <div className="space-y-6 p-6">
      {/* Line chart */}
      <ChartContainer config={chartData.config} className="h-80 w-full">
        <LineChart width={500} height={300} data={chartData.records}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip
            wrapperStyle={{ zIndex: 1000 }}
            content={(
              <ChartTooltipContent
                labelFormatter={label => t('statistics.yearLabel', { year: label })}
              />
            )}
          />
          <Legend content={<ChartLegendContent />} />
          {Object.entries(chartData.config).map(([key, config]) => (
            <Line key={key} type="monotone" dataKey={key} stroke={config.color} />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}

export function AsylumApplicationsEvolutionInGreeceDetails({
  records,
  loading,
  error,
  customText,
}: {
  records: AsylumApplicationRecords
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'

  const [byOption, setByOption] = useState<ByOption>('byPeriod')

  const display = useMemo(() => {
    switch (byOption) {
      case 'byPeriod':
        return <ByPeriod records={records.byPeriod} />
      case 'byNationality':
        return <ByNationality records={records.byNationality} />
      case 'byGenderAge':
        return <ByGenderAge records={records.byGenderAge} />
      default:
        return <div />
    }
  }, [records, byOption])

  const keyFigure = useMemo(() => {
    const configMap: Record<string, { data: any[]; keys: string[] }> = {
      byPeriod: { data: records.byPeriod, keys: ['first_time_applicants', 'subsequent_applicants'] },
      byNationality: { data: records.byNationality, keys: ['total_applications'] },
      byGenderAge: { data: records.byGenderAge, keys: ['applications'] },
    };

    const currentSelection = configMap[byOption];

    // Fallback
    if (!currentSelection || currentSelection.data.length === 0) {
      return { value: 0, firstYear: 0, lastYear: 0 };
    }

    const { data, keys } = currentSelection;
    let total = 0;
    for (const record of data) {
      for (const key of keys) {
        total += record[key] || 0;
      }
    }

    const firstYear = data[0].year;
    const lastYear = data[data.length - 1].year;

    return { value: total, firstYear, lastYear };
  }, [records, byOption]);

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.asylumEvolutionGreece')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  return (
    <div className="mx-auto max-w-5xl my-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: '#04356C' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>

          <div className="flex gap-2">
            <select
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm"
              value={byOption}
              onChange={e => {
                const value = e.target.value;
                setByOption(value as ByOption);
              }}
            >
              <option value="byPeriod">{t('statistics.byPeriod')}</option>
              <option value="byGenderAge">{t('statistics.byGenderAge')}</option>
              <option value="byNationality">{t('statistics.byNationality')}</option>
            </select>
          </div>
        </div>

        {/* Card body */}
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-[2fr_1fr] gap-4">
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

            <div className="rounded-lg border border-gray-200 p-5">
              {subtitle && (
                <p className="text-sm font-bold text-gray-900 mb-4">{subtitle}</p>
              )}
              <p className="text-6xl font-bold text-gray-900 leading-none tabular-nums">
                {Number(keyFigure.value).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {keyFigure.firstYear} - {keyFigure.lastYear}
              </p>
            </div>
          </div>
        </div>

        {display}

        {/* Card footer — source & last updated */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500">
            {customText.source && (
              <span>
                <span className="font-medium text-gray-600">{t('statistics.source')}:</span>
                {' '}
                <a
                  href={customText.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-800 transition-colors"
                >
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
