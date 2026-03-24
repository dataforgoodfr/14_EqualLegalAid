import { useAsylumSeekersRegion } from '@/hooks/useAsylumSeekersRegion'
import type { AsylumSeekersRegionRecord } from '@/hooks/useAsylumSeekersRegion'

export function MapPage() {
  const { records, loading, error } = useAsylumSeekersRegion()
  return <MapPageDetails records={records} loading={loading} error={error} />
}

// Ind5_Asylum seekers_Region
export function MapPageDetails({ records, loading, error }: { records: AsylumSeekersRegionRecord[], loading: boolean, error: string | null }) {
  console.log(records, loading, error)
  return (
    <div>Empty page</div>
  )
}