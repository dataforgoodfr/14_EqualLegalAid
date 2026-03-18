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
import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'

const chartConfig = {
  first_time_applicants: {
    label: 'First time',
    color: '#04356C',
  },
  subsequent_applicants: {
    label: 'Subsequent',
    color: '#6B9BD2',
  },
} satisfies ChartConfig

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-xs">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function AsylumApplicationsPage() {
  const { records, loading, error } = useAsylumApplications()
  const [selectedCountry, setSelectedCountry] = useState<string>()

  const countries = useMemo(() => {
    const set = new Set(records.map(r => r.name_country))
    return Array.from(set).filter(Boolean).sort()
  }, [records])

  useEffect(() => {
    if (!selectedCountry && countries.length > 0) {
      setSelectedCountry(countries[0])
    }
  }, [countries, selectedCountry])

  const chartData = useMemo(() => {
    const filtered = records.filter(r => r.name_country === selectedCountry)

    const byYear = new Map<number, {
      year: number
      first_time_applicants: number
      subsequent_applicants: number
      total_applicants: number
      total_country_population: number
      percentage: number
    }>()

    for (const r of filtered) {
      const existing = byYear.get(r.year)
      if (existing) {
        existing.first_time_applicants += r.first_time_applicants
        existing.subsequent_applicants += r.subsequent_applicants
        existing.total_applicants += r.total_applicants
        existing.total_country_population += r.total_country_population
        existing.percentage += r.percentage
      }
      else {
        byYear.set(r.year, {
          year: r.year,
          first_time_applicants: r.first_time_applicants,
          subsequent_applicants: r.subsequent_applicants,
          total_applicants: r.total_applicants,
          total_country_population: r.total_country_population,
          percentage: r.percentage,
        })
      }
    }

    return Array.from(byYear.values()).sort((a, b) => a.year - b.year)
  }, [records, selectedCountry])

  const latestYear = chartData.at(-1)

  const firstTimeRatio = latestYear && latestYear.total_applicants > 0
    ? ((latestYear.first_time_applicants / latestYear.total_applicants) * 100).toFixed(1)
    : null

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold" style={{ color: '#04356C' }}>
          EU Asylum Applications
        </h1>
        <p className="text-sm text-muted-foreground">
          First-time and subsequent applicants per year
        </p>
      </div>

      {/* Country selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Country</span>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select a country" />
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
            <p className="text-sm text-muted-foreground">No data for this selection.</p>
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
                      labelFormatter={label => `Year: ${label}`}
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

      {/* Stat cards — only meaningful for a single country */}
      {latestYear && (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Latest data · {latestYear.year}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total applicants"
              value={latestYear.total_applicants.toLocaleString()}
            />
            <StatCard
              label="First-time applicants"
              value={latestYear.first_time_applicants.toLocaleString()}
              sub={firstTimeRatio ? `${firstTimeRatio}% of total` : undefined}
            />
            <StatCard
              label="Subsequent applicants"
              value={latestYear.subsequent_applicants.toLocaleString()}
              sub={firstTimeRatio ? `${(100 - parseFloat(firstTimeRatio)).toFixed(1)}% of total` : undefined}
            />
            {latestYear.percentage > 0 && (
              <StatCard
                label="% of country population"
                value={`${latestYear.percentage.toFixed(3)}%`}
                sub={`Population: ${latestYear.total_country_population.toLocaleString()}`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
