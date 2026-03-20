import { AsylumApplicationsDetails } from '@/components/Indicators/AsylumApplicationsDetails'
import { useAsylumApplications } from '@/hooks/useAsylumApplications'

export function AsylumApplicationsPage() {
  const { records, loading, error } = useAsylumApplications()
  return <AsylumApplicationsDetails records={records} loading={loading} error={error} />
}
