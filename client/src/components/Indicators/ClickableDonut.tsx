import { store } from '@/redux/store'
import { setChartToDisplay } from '@/redux/chartSlice'
import { PieChart, Pie, Tooltip, Sector, type PieSectorShapeProps } from 'recharts'

export interface PieChartData {
  name: string
  value: number
  color: string
  link: string
}

export function ClickableDonut({ donutData }: { donutData: PieChartData[] }) {
  function customShapeFunction(props: PieSectorShapeProps) {
    return <a onClick={() => { onclick(donutData[props.index].link) }}><Sector {...props} fill={donutData[props.index].color} /></a>
  }

  return (
    <PieChart
      style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '80vh', aspectRatio: 1 }}
      responsive
    >
      <Pie
        data={donutData}
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

function onclick(chartLink: string) {
  store.dispatch(setChartToDisplay(chartLink))
  console.log({ chartLink })
}
