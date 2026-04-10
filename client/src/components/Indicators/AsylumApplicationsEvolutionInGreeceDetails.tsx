import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import {
  ChartContainer,
  ChartLegendContent,
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

  return (
    <>
      <h1 className="text-2xl font-bold" style={{ color: '#04356C' }}>
        Asylum Application Evolution in Greece
      </h1>
      <br />
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
    </>
  )
}
