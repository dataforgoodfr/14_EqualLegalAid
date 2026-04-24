import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { ChartConfig } from '@/components/ui'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { useTranslation } from 'react-i18next'

export function AsylumApplicationsDetails({
  records,
  loading,
  error,
  customText,
}: {
  records: AsylumApplicationRecord[]
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'el' ? 'gr' : 'en'

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

  const [selectedCountry, setSelectedCountry] = useState<string>()

  const countries = useMemo(() => {
    const set = new Set(records.map(r => r.name_country))
    return Array.from(set).filter(Boolean).sort()
  }, [records])

  useEffect(() => {
    if (!selectedCountry && countries.length > 0) {
      const eu27 = countries.find(c => c.toLowerCase().includes('european union'))
      setSelectedCountry(eu27 ?? countries[0])
    }
  }, [countries, selectedCountry])

  const chartData = useMemo(() => {
    const filtered = records.filter(r => r.name_country === selectedCountry)

    const nonZeroByYear = new Map<number, {
      year: number
      first_time_applicants: number
      subsequent_applicants: number
      total_applicants: number
      total_country_population: number
      percentage: number
    }>()

    for (const record of filtered) {
      const first_time_applicants = record.first_time_applicants
      const subsequent_applicants = record.subsequent_applicants
      const total_applicants = first_time_applicants + subsequent_applicants

      // we do nothing if there is no applicants in one record
      if (total_applicants > 0) {
        const year = record.year
        const percentage = record.percentage
        const total_country_population = record.total_country_population

        const existing = nonZeroByYear.get(record.year)
        if (existing) {
          // we already have one record for this year and update it
          existing.first_time_applicants += first_time_applicants
          existing.subsequent_applicants += subsequent_applicants
          existing.total_applicants += total_applicants
          existing.total_country_population += total_country_population
          existing.percentage += percentage
        }
        else {
          nonZeroByYear.set(year, {
            year: year,
            first_time_applicants: first_time_applicants,
            subsequent_applicants: subsequent_applicants,
            total_applicants: total_applicants,
            total_country_population: total_country_population,
            percentage: percentage,
          })
        }
      }
    }

    return Array.from(nonZeroByYear.values()).sort((a, b) => a.year - b.year)
  }, [records, selectedCountry])

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  const isGr = lang === 'gr'
  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.euAsylumApplications')
  const subtitle = (isGr ? customText?.subtitle_gr : customText?.subtitle_en) || t('statistics.firstTimeSubsequentPerYear')
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en

  return (
    <div className="mx-auto max-w-5xl my-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <h2 className="text-xl font-bold" style={{ color: '#04356C' }}>
            {title}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {subtitle}
          </p>
        </div>

        {/* Card body */}
        <div className="space-y-6 p-6">

          {/* Country selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{t('statistics.country')}</span>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t('statistics.selectCountry')} />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chart */}
          {chartData.length === 0
            ? (
              <p className="text-muted-foreground text-sm">{t('statistics.noData')}</p>
            )
            : (
              <ChartContainer config={chartConfig} className="h-80 w-full">
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                  />
                  <ChartTooltip
                    content={(
                      <ChartTooltipContent
                        labelFormatter={label => t('statistics.yearLabel', { year: label })}
                      />
                    )}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="first_time_applicants"
                    stackId="a"
                    fill="var(--color-first_time_applicants)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="subsequent_applicants"
                    stackId="a"
                    fill="var(--color-subsequent_applicants)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}

          {/* Explanatory text */}
          {(explanatoryTitle || explanatoryText) && (
            <div className="rounded-lg bg-gray-50 px-4 py-4 space-y-1.5">
              {explanatoryTitle && (
                <h3 className="text-sm font-semibold" style={{ color: '#04356C' }}>
                  {explanatoryTitle}
                </h3>
              )}
              {explanatoryText && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {explanatoryText}
                </p>
              )}
            </div>
          )}
        </div>

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
