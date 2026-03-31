import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { store } from '@/redux/store'
import { setChartToDisplay } from '@/redux/chartSlice'
import { PieChart, Pie, Tooltip, Sector, type PieSectorShapeProps } from 'recharts'
import { useAppSelector } from '@/hooks/reduxHook'

interface PieChartData {
  name: string
  value: number
  color: string
  link: string
}

export function DonutPage() {
  const { records, loading, error } = useAsylumApplications()
  return <DonutPageDetails records={records} loading={loading} error={error} />
  // return <DonutPageDetailsDev />
}

function DonutPageDetails({ records, loading, error }: { records: AsylumApplicationRecord[], loading: boolean, error: string | null }) {
  console.log(records, loading, error)
  const chartName = useAppSelector(state => state.charts.chartName)
  console.log({ chartName })

  return (
    <>
      <h2 className="text-base font-semibold">Number of asylum applications in Europe</h2>
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

function onclick(chartLink: string) {
  store.dispatch(setChartToDisplay(chartLink))
  console.log({ chartLink })
}

function GeneralPie() {
  function customShapeFunction(props: PieSectorShapeProps) {
    return <a onClick={() => { onclick(data[props.index].link) }}><Sector {...props} fill={data[props.index].color} /></a>
  }
  const data: PieChartData[] = [
    { name: 'Group A', value: 400, color: 'red', link: 'chart_number_0' },
    { name: 'Group B', value: 300, color: 'black', link: 'chart_number_1' },
    { name: 'Group C', value: 300, color: 'yellow', link: 'chart_number_2' },
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
  const data: PieChartData[] = [
    { name: 'Group 1', value: 400, color: 'red', link: '' },
    { name: 'Group 2', value: 300, color: 'black', link: '' },
    { name: 'Group 3', value: 300, color: 'yellow', link: '' },
    { name: 'Group 4', value: 40, color: 'purple', link: '' },
    { name: 'Group 5', value: 300, color: 'cyan', link: '' },
    { name: 'Group 6', value: 300, color: 'green', link: '' },
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

// function DonutPageDetailsDev() {
//   const chartName = useAppSelector(state => state.charts.chartName)
//   console.log({ chartName })

//   return (
//     <>
//       {chartName != 'global'
//         && (
//           <button onClick={() => {
//             const chartName: string = 'global'
//             store.dispatch(setChartToDisplay(chartName))
//           }}
//           >
//             Press me to go back to the general chart
//           </button>
//         )}
//       {chartName === 'global' && <GeneralPie />}
//       {chartName === 'chart_number_0' && <DetailPie />}
//       {chartName === 'chart_number_1' && <p>Chart 1</p>}
//       {chartName === 'chart_number_2' && <p>Chart 2</p>}
//     </>
//   )
// }
