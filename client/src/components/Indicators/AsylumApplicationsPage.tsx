import { AsylumApplicationsDetails } from '@/components/Indicators/AsylumApplicationsDetails'
import { EuropeRegionMap } from '@/components/Indicators/EuropeRegionMap'
import { useAsylumApplications } from '@/hooks/useAsylumApplications'

export function AsylumApplicationsPage() {
  const { records, loading, error } = useAsylumApplications()
  return (
    <>
      <EuropeRegionMap />
      <AsylumApplicationsDetails records={records} loading={loading} error={error} />
    </>
  )
}
