import { useGreeceTotalApplications } from '@/hooks/useGreeceTotalApplications'
import { AsylumApplicationsEvolutionInGreeceDetails } from '@/components/Indicators/AsylumApplicationsEvolutionInGreeceDetails'

export function AsylumApplicationsEvolutionInGreece() {
  const { records, loading, error } = useGreeceTotalApplications()
  return <AsylumApplicationsEvolutionInGreeceDetails records={records} loading={loading} error={error} />
}
