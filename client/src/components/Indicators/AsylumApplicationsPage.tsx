import { AsylumApplicationsDetails } from '@/components/Indicators/AsylumApplicationsDetails'
import { EuropeRegionMap } from '@/components/Indicators/EuropeRegionMap'
import { AsylumApplicationsEvolutionInGreece } from '@/components/Indicators/AsylumApplicationsEvolutionInGreece'
import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import { GreeceMap } from './GreeceMap'

export function AsylumApplicationsPage() {
  const { records, loading, error } = useAsylumApplications()
  return (
    <>
      <EuropeRegionMap />
      <AsylumApplicationsDetails records={records} loading={loading} error={error} />
      <AsylumApplicationsEvolutionInGreece />
      <GreeceMap />
    </>
  )
}
