import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { PieChart, Pie, Tooltip, Sector, type PieSectorShapeProps } from 'recharts'

export function DonutPage() {
  // const { records, loading, error } = useAsylumApplications()
  // return <DonutPageDetails records={records} loading={loading} error={error} />
  return <DonutPageDetailsDev />
}

function DonutPageDetails({ records, loading, error }: { records: AsylumApplicationRecord[], loading: boolean, error: string | null }) {
  console.log(records, loading, error)
  return (
    <div>Empty page</div>
  )
}

function GeneralPie() {
  function customShapeFunction(props: PieSectorShapeProps) {
    const link = props.index.toString()
    return <a href={link}><Sector {...props} fill={data[props.index].color} /></a>
  }
  const data = [
    { name: 'Group A', value: 400, color: 'red' },
    { name: 'Group B', value: 300, color: 'black' },
    { name: 'Group C', value: 300, color: 'yellow' },
  ]

  return (
    <PieChart
      style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '80vh', aspectRatio: 1 }}
      responsive
    >
      <Pie
        data={data}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius="100%"
        innerRadius="50%"
        shape={customShapeFunction}
      />
      <Tooltip />
    </PieChart>
  )
}

function DetailPie() {
  function customShapeFunction(props: PieSectorShapeProps) {
    return <Sector {...props} fill={data[props.index].color} />
  }
  const data = [
    { name: 'Group A', value: 400, color: 'red' },
    { name: 'Group B', value: 300, color: 'black' },
    { name: 'Group C', value: 300, color: 'yellow' },
  ]

  return (
    <PieChart
      style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '80vh', aspectRatio: 1 }}
      responsive
    >
      <Pie
        data={data}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius="100%"
        innerRadius="50%"
        shape={customShapeFunction}
      />
      <Tooltip />
    </PieChart>
  )
}

function DonutPageDetailsDev() {
  return (
    <>
      <GeneralPie />
      <DetailPie />
    </>
  )
}
