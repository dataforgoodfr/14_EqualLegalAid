import { useAsylumSeekerByRegionOfGreece } from '@/hooks/useAsylumSeekerByRegionOfGreece'
// import { useAsylumSeekerByRegionOfGreeceWithEmptyData,  } from '@/hooks/useAsylumSeekerByRegionOfGreece'
import { GreeceMapDetails } from '@/components/Indicators/GreeceMapDetails'
import { AirtableDataCheckButton } from '../ui/airtable-data-check-button'

export function GreeceMap() {
  // const { records, loading, error } = useAsylumSeekerByRegionOfGreeceWithEmptyData()
  const { records, loading, error } = useAsylumSeekerByRegionOfGreece()
  return (
    <>
      <AirtableDataCheckButton records={records} loading={loading} error={error} />
      <GreeceMapDetails records={records} loading={loading} error={error} />
    </>
  )
}
