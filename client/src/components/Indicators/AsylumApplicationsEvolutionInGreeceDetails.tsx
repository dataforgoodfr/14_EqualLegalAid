import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import {
  ChartContainer,
  ChartLegendContent,
  StatCard,
} from '@/components/ui'
import type { ChartConfig } from '@/components/ui'

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

export function AsylumApplicationsEvolutionInGreeceDetails({ records, loading, error }: { records: AsylumApplicationRecord[], loading: boolean, error: string | null }) {
  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  { /* ───────── Example of data ────────── */ }
  // first_time_applicants: 11370
  // id: "rec9TbyZBzbF9Tmra"
  // name_country: "Greece"
  // percentage: 0
  // subsequent_applicants: 0
  // total_applicants: 13205
  // total_country_population: 10858018
  // year: 2015

  // extract key statistics from the records to populate the sub-title information bar
  let totalFirstTime = 0
  let totalSubSequent = 0

  for (const record of records) {
    totalFirstTime += record.first_time_applicants
    totalSubSequent += record.subsequent_applicants
  }

  const totalApplicants = totalFirstTime + totalSubSequent

  const firstYear: number = records[0].year
  const lastYear: number = records[records.length - 1].year
  const betweenFirstYearAndLastYear = `between ${firstYear} and ${lastYear}`

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold" style={{ color: '#04356C' }}>
        Asylum Application Evolution in Greece
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label={`Total First-time ${betweenFirstYearAndLastYear}`}
          value={totalFirstTime.toLocaleString()}
        />
        <StatCard
          label={`Total subsequent ${betweenFirstYearAndLastYear}`}
          value={totalSubSequent.toLocaleString()}
        />
        <StatCard
          label={`Total ${betweenFirstYearAndLastYear}`}
          value={totalApplicants.toLocaleString()}
        />
      </div>
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <LineChart width={500} height={300} data={records}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          {/* Tooltip is used to allow interactive displaying data on mouse hover */}
          <Tooltip />
          <Legend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="first_time_applicants" stroke={chartConfig.first_time_applicants.color} />
          <Line type="monotone" dataKey="subsequent_applicants" stroke={chartConfig.subsequent_applicants.color} />
        </LineChart>
      </ChartContainer>
      {/* <button
        onClick={() => {
          console.log({ records }, { loading }, { error })
        }}
      >
        My Button
      </button> */}
    </div>
  )
}
