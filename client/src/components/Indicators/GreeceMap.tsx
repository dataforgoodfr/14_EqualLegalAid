import { useAsylumSeekerByRegionOfGreece } from '@/hooks/useAsylumSeekerByRegionOfGreece'
import { GreeceMapDetails } from '@/components/Indicators/GreeceMapDetails'

export function GreeceMap() {
  const { records, loading, error } = useAsylumSeekerByRegionOfGreece()
  // return <GreeceMapDetails records={records} loading={loading} error={error} />
  return (
    <button onClick={() => {
      console.log({ records })
      console.log({ loading })
      console.log({ error })
    }}
    >
      AirTable Data Checking Button
    </button>
  )
}
