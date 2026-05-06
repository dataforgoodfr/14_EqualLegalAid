import { useOutletContext } from 'react-router-dom'
import { AsylumApplicationsDetails } from '@/components/Indicators/AsylumApplicationsDetails'
import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import type { StatisticOutletContext } from '@/types'

export const AsylumApplicationsInEuropeanUnion = () => {
  const { records, loading, error } = useAsylumApplications()
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <AsylumApplicationsDetails records={records} loading={loading} error={error} customText={getCustomText('AsylumApplicationsInEuropeanUnion')} />
  )
}
