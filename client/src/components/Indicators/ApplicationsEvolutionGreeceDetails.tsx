import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { ApplicationsEvolutionRecord } from '@/hooks/useApplicationsEvolution'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { StatCard, ChartContainer, ChartTooltipContent, ChartLegendContent, IndicatorInfoButton } from '@/components/ui'
import type { ChartConfig } from '@/components/ui'
import { useTranslation } from 'react-i18next'

export function ApplicationsEvolutionGreeceDetails({
  records,
  loading,
  error,
  customText,
}: {
  records: ApplicationsEvolutionRecord[]
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'

  const chartConfig = {
    first_applications: { label: t('statistics.firstTime'), color: '#04356C' },
    subsequent_applications: { label: t('statistics.subsequent'), color: '#6B9BD2' },
  } satisfies ChartConfig

  const totals = useMemo(() => {
    let first = 0
    let subsequent = 0
    for (const r of records) {
      first += r.first_applications
      subsequent += r.subsequent_applications
    }
    return { first, subsequent, total: first + subsequent }
  }, [records])

  const firstYear = records[0]?.year
  const lastYear = records[records.length - 1]?.year

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.applicationsEvolutionGreece')
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
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: '#04356C' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>

        {/* Card body */}
        <div className="space-y-6 p-6">

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              label={t('statistics.totalFirstTime', { start: firstYear, end: lastYear })}
              value={totals.first.toLocaleString()}
            />
            <StatCard
              label={t('statistics.totalSubsequent', { start: firstYear, end: lastYear })}
              value={totals.subsequent.toLocaleString()}
            />
            <StatCard
              label={t('statistics.total', { start: firstYear, end: lastYear })}
              value={totals.total.toLocaleString()}
            />
          </div>

          {/* Line chart */}
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <LineChart data={records}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                content={<ChartTooltipContent labelFormatter={label => t('statistics.yearLabel', { year: label })} />}
              />
              <Legend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="first_applications" stroke={chartConfig.first_applications.color} />
              <Line type="monotone" dataKey="subsequent_applications" stroke={chartConfig.subsequent_applications.color} />
            </LineChart>
          </ChartContainer>

          {/* Explanatory text */}
          {(explanatoryTitle || explanatoryText) && (
            <div className="rounded-lg bg-gray-50 px-4 py-4 space-y-1.5">
              {explanatoryTitle && (
                <h3 className="text-sm font-semibold" style={{ color: '#04356C' }}>{explanatoryTitle}</h3>
              )}
              {explanatoryText && (
                <p className="text-muted-foreground text-sm leading-relaxed">{explanatoryText}</p>
              )}
            </div>
          )}
        </div>

        {/* Card footer */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500">
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
        )}
      </div>
    </div>
  )
}
