import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { store } from '@/redux/store'
import { setChartToDisplay } from '@/redux/chartSlice'
import { ClickableDonut, type PieChartData } from '@/components/Indicators/ClickableDonut'
import { useAppSelector } from '@/hooks/reduxHook'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import type { chartName } from '@/types/chartNames'

export function DonutPage() {
  const { records, loading, error } = useAsylumApplications()
  return <DonutPageDetails records={records} loading={loading} error={error} />
  // return <DonutPageDetailsDev />
}

function createDataForAllYear(records: AsylumApplicationRecord[]) {
  let total_first_time: number = 0
  let total_subsequent: number = 0
  for (const record of records) {
    total_first_time += record.first_time_applicants
    total_subsequent += record.subsequent_applicants
  }

  const dataForAllYear: PieChartData[] = [
    { name: 'First Time Applicants', value: total_first_time, color: '#04356C', link: 'chart_first_applicants' },
    { name: 'Subsequent Applicants', value: total_subsequent, color: '#6B9BD2', link: 'chart_subsequent_applicants' },
  ]
  return dataForAllYear
}

function DonutPageDetails({ records, loading, error }: { records: AsylumApplicationRecord[], loading: boolean, error: string | null }) {
  const chartName: chartName = useAppSelector(state => state.charts.chartName)

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  const dataForAllYear: PieChartData[] = createDataForAllYear(records)

  const detailData1: PieChartData[] = [
    { name: 'Group A', value: 400, color: 'red', link: null },
    { name: 'Group B', value: 300, color: 'black', link: null },
    { name: 'Group B', value: 300, color: 'grey', link: null },
    { name: 'Group B', value: 300, color: 'black', link: null },
    { name: 'Group C', value: 300, color: 'darkred', link: null },
  ]

  const detailData2: PieChartData[] = [
    { name: 'Group A', value: 400, color: 'red', link: null },
    { name: 'Group B', value: 300, color: 'black', link: null },
    { name: 'Group C', value: 300, color: 'yellow', link: null },
    { name: 'Group 4', value: 40, color: 'purple', link: null },
    { name: 'Group 5', value: 300, color: 'cyan', link: null },
  ]

  return (
    <>
      <h2 className="text-base font-semibold">Number of asylum applications in Europe</h2>
      {chartName != 'global'
        && (
          <button onClick={() => {
            const chartName: chartName = 'global'
            store.dispatch(setChartToDisplay(chartName))
          }}
          >
            Return
          </button>
        )}
      {chartName === 'global' && <ClickableDonut donutData={dataForAllYear} />}
      {chartName === 'chart_first_applicants' && <ClickableDonut donutData={detailData1} />}
      {chartName === 'chart_subsequent_applicants' && <ClickableDonut donutData={detailData2} />}

    </>
  )
}
