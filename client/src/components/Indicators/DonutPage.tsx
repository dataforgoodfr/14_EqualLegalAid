import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { store } from '@/redux/store'
import { setChartToDisplay } from '@/redux/chartSlice'
import { PieChart, Pie, Tooltip, Sector, type PieSectorShapeProps } from 'recharts'
import { useAppSelector } from '@/hooks/reduxHook'

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

function onclick(index: number) {
  const chartName: string = 'chart_number_' + index.toString()
  store.dispatch(setChartToDisplay(chartName))
}

function GeneralPie() {
  function customShapeFunction(props: PieSectorShapeProps) {
    return <a onClick={() => { onclick(props.index) }}><Sector {...props} fill={data[props.index].color} /></a>
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
    { name: 'Group 1', value: 400, color: 'red' },
    { name: 'Group 2', value: 300, color: 'black' },
    { name: 'Group 3', value: 300, color: 'yellow' },
    { name: 'Group 4', value: 40, color: 'purple' },
    { name: 'Group 5', value: 300, color: 'cyan' },
    { name: 'Group 6', value: 300, color: 'green' },
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
  const chartName = useAppSelector(state => state.charts.chartName)
  console.log({ chartName })

  return (
    <>
      {chartName != 'global'
        && (
          <button onClick={() => {
            const chartName: string = 'global'
            store.dispatch(setChartToDisplay(chartName))
          }}
          >
            Press me to go back to the general chart
          </button>
        )}
      {chartName === 'global' && <GeneralPie />}
      {chartName === 'chart_number_0' && <DetailPie />}
      {chartName === 'chart_number_1' && <p>Chart 1</p>}
      {chartName === 'chart_number_2' && <p>Chart 2</p>}
    </>
  )
}
