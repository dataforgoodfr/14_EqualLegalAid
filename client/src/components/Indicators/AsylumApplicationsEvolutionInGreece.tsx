import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useGreeceTotalApplications } from '@/hooks/useGreeceTotalApplications'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'

export function AsylumApplicationsEvolutionInGreece() {
  const { records, loading, error } = useGreeceTotalApplications()
  return <AsylumApplicationsEvolutionInGreeceDetails records={records} loading={loading} error={error} />
}

function AsylumApplicationsEvolutionInGreeceDetails({ records, loading, error }: { records: AsylumApplicationRecord[], loading: boolean, error: string | null }) {
  const data = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
  ]

  return (
    <>
      <h2 className="text-base font-semibold">Asylum Application Evolution in Greece</h2>
      <LineChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {/* Tooltip is used to allow interactive displaying data on mouse hover */}
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="pv" stroke="#8884d8" />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
      </LineChart>
      <button
        onClick={() => {
          console.log({ records }, { loading }, { error })
        }}
      >
        My Button
      </button>
    </>
  )
}
