import { MapPageDetails } from '@/components/Indicators/MapPage'
import { useAsylumSeekersRegion } from '@/hooks/useAsylumSeekersRegion'

export function AsylumSeekersRegionPage() {
  const { records, loading, error } = useAsylumSeekersRegion()
  return <MapPageDetails records={records} loading={loading} error={error} />
}
