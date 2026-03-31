import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { store } from '@/redux/store'
import { setChartToDisplay } from '@/redux/chartSlice'
import { ClickableDonut, type PieChartData } from '@/components/Indicators/ClickableDonut'
import { useAppSelector } from '@/hooks/reduxHook'

export function DonutPage() {
  const { records, loading, error } = useAsylumApplications()
  return <DonutPageDetails records={records} loading={loading} error={error} />
  // return <DonutPageDetailsDev />
}

function DonutPageDetails({ records, loading, error }: { records: AsylumApplicationRecord[], loading: boolean, error: string | null }) {
  console.log(records, loading, error)
  const chartName = useAppSelector(state => state.charts.chartName)
  console.log({ chartName })

  const generalData: PieChartData[] = [
    { name: 'Group A', value: 400, color: 'red', link: 'chart_number_0' },
    { name: 'Group B', value: 300, color: 'black', link: 'chart_number_1' },
    { name: 'Group C', value: 300, color: 'yellow', link: 'chart_number_2' },
  ]

  const detailData1: PieChartData[] = [
    { name: 'Group A', value: 400, color: 'red', link: 'chart_number_0' },
    { name: 'Group B', value: 300, color: 'black', link: 'chart_number_1' },
    { name: 'Group C', value: 300, color: 'yellow', link: 'chart_number_2' },
  ]

  const detailData2: PieChartData[] = [
    { name: 'Group A', value: 400, color: 'red', link: 'chart_number_0' },
    { name: 'Group B', value: 300, color: 'black', link: 'chart_number_1' },
    { name: 'Group C', value: 300, color: 'yellow', link: 'chart_number_2' },
  ]

  const detailData3: PieChartData[] = [
    { name: 'Group A', value: 400, color: 'red', link: 'chart_number_0' },
    { name: 'Group B', value: 300, color: 'black', link: 'chart_number_1' },
    { name: 'Group C', value: 300, color: 'yellow', link: 'chart_number_2' },
    { name: 'Group 4', value: 40, color: 'purple', link: '' },
    { name: 'Group 5', value: 300, color: 'cyan', link: '' },
  ]

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
      {chartName === 'global' && <ClickableDonut donutData={generalData} />}
      {chartName === 'chart_number_0' && <ClickableDonut donutData={detailData1} />}
      {chartName === 'chart_number_1' && <ClickableDonut donutData={detailData2} />}
      {chartName === 'chart_number_2' && <ClickableDonut donutData={detailData3} />}
    </>
  )
}
