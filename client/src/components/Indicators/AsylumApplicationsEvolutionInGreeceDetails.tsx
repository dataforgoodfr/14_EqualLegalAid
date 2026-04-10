import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'

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
      <h2 className="text-base font-semibold">Asylum Application Evolution in Greece</h2>
      <LineChart width={500} height={300} data={records}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        {/* Tooltip is used to allow interactive displaying data on mouse hover */}
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="first_time_applicants" stroke="#8884d8" />
        <Line type="monotone" dataKey="subsequent_applicants" stroke="#82ca9d" />
      </LineChart>
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
