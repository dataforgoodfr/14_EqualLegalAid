import { useGreeceTotalApplications } from '@/hooks/useGreeceTotalApplications'
import { GreeceMapDetails } from '@/components/Indicators/GreeceMapDetails'

export function GreeceMap() {
  const { records, loading, error } = useGreeceTotalApplications()
  return <GreeceMapDetails records={records} loading={loading} error={error} />
}
