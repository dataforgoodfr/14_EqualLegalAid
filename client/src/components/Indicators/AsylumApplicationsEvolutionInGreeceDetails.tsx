import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import type { AsylumApplicationByGenderAgeRecord, AsylumApplicationByNationalityRecord, AsylumApplicationRecords } from '@/hooks/useGreeceTotalApplications'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  IndicatorInfoButton,
  CHART_GRID_PROPS,
  CHART_AXIS_PROPS,
  CHART_LINE_PROPS,
} from '@/components/ui'
import type { ChartConfig } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

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

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <LineChart width={500} height={300} data={records}>
        <CartesianGrid {...CHART_GRID_PROPS} />
        <XAxis dataKey="year" {...CHART_AXIS_PROPS} />
        <YAxis {...CHART_AXIS_PROPS} />
        <Tooltip
          content={(
            <ChartTooltipContent
              labelFormatter={label => t('statistics.yearLabel', { year: label })}
              sortByValueDesc
            />
          )}
        />
        <Legend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="first_time_applicants" stroke={chartConfig.first_time_applicants.color} {...CHART_LINE_PROPS} />
        <Line type="monotone" dataKey="subsequent_applicants" stroke={chartConfig.subsequent_applicants.color} {...CHART_LINE_PROPS} />
      </LineChart>
    </ChartContainer>
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
    // Taller than the other charts on purpose: with a dozen+ overlapping
    // country lines, more vertical room is what actually reduces visual
    // overlap (see the "Country of origin" readability request).
    <ChartContainer config={chartData.config} className="h-[560px] w-full">
      <LineChart width={500} height={300} data={chartData.records}>
        <CartesianGrid {...CHART_GRID_PROPS} />
        <XAxis dataKey="year" {...CHART_AXIS_PROPS} />
        <YAxis width={70} {...CHART_AXIS_PROPS} />
        <Tooltip
          wrapperStyle={{ zIndex: 1000 }}
          content={(
            <ChartTooltipContent
              labelFormatter={label => t('statistics.yearLabel', { year: label })}
              multiColumn
              sortByValueDesc
            />
          )}
        />
        <Legend content={<ChartLegendContent />} />
        {Object.entries(chartData.config).map(([key, config]) => (
          <Line key={key} type="monotone" dataKey={key} stroke={config.color} {...CHART_LINE_PROPS} />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

function ByPivot({
  records,
  pivotKey,
}: {
  records: AsylumApplicationByGenderAgeRecord[]
  pivotKey: 'gender' | 'age'
}) {
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    return {
      config: generateChartConfig(records, [pivotKey]),
      records: aggregateRecords(records, "applications", [pivotKey]),
    }
  }, [records, pivotKey])

  if (records.length === 0) return <p className="text-muted-foreground text-sm p-6">{t('statistics.noData')}</p>

  return (
    <ChartContainer config={chartData.config} className="h-80 w-full">
      <LineChart width={500} height={300} data={chartData.records}>
        <CartesianGrid {...CHART_GRID_PROPS} />
        <XAxis dataKey="year" {...CHART_AXIS_PROPS} />
        <YAxis {...CHART_AXIS_PROPS} />
        <Tooltip
          wrapperStyle={{ zIndex: 1000 }}
          content={(
            <ChartTooltipContent
              labelFormatter={label => t('statistics.yearLabel', { year: label })}
              sortByValueDesc
            />
          )}
        />
        <Legend content={<ChartLegendContent />} />
        {Object.entries(chartData.config).map(([key, config]) => (
          <Line key={key} type="monotone" dataKey={key} stroke={config.color} {...CHART_LINE_PROPS} />
        ))}
      </LineChart>
    </ChartContainer>
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
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: '#04356C' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>
          {subtitle && (
            <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Card body — charts stacked sequentially instead of behind a filter */}
        <div className="space-y-8 p-6">
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

          <div>
            <h3 className="mb-2 text-sm font-bold text-gray-900">{t('statistics.dataApplicationsPerYear')}</h3>
            <ByPeriod records={records.byPeriod} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold text-gray-900">{t('statistics.dataApplicantsByCountryOfOrigin')}</h3>
            <ByNationality records={records.byNationality} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold text-gray-900">{t('statistics.dataApplicantsByAgeGroup')}</h3>
            <ByPivot records={records.byGenderAge} pivotKey="age" />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold text-gray-900">{t('statistics.dataApplicantsByGender')}</h3>
            <ByPivot records={records.byGenderAge} pivotKey="gender" />
          </div>
        </div>

        {/* Card footer — source & last updated */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="space-y-1 border-t border-gray-100 bg-gray-50/60 px-6 py-3 text-xs text-gray-500">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
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
