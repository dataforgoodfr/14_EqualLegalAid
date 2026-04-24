import { AsylumApplicationsDetails } from '@/components/Indicators/AsylumApplicationsDetails'
import { EuropeRegionMap } from '@/components/Indicators/EuropeRegionMap'
import { AsylumApplicationsEvolutionInGreece } from '@/components/Indicators/AsylumApplicationsEvolutionInGreece'
import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import { useIndicatorCustomTexts } from '@/hooks/useIndicatorCustomTexts'

export function AsylumApplicationsPage() {
  const { records, loading, error } = useAsylumApplications()
  const { records: customTexts } = useIndicatorCustomTexts()
  const barChartText = customTexts[0] ?? null

  return (
    <>
      <EuropeRegionMap />
      <AsylumApplicationsDetails records={records} loading={loading} error={error} customText={barChartText} />
      <AsylumApplicationsEvolutionInGreece />
    </>
  )
}
