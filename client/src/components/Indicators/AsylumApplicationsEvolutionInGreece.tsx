import { useGreeceTotalApplications } from '@/hooks/useGreeceTotalApplications'
import { AsylumApplicationsEvolutionInGreeceDetails } from '@/components/Indicators/AsylumApplicationsEvolutionInGreeceDetails'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'

export function AsylumApplicationsEvolutionInGreece({ customText }: { customText?: IndicatorCustomText | null }) {
  const { records, loading, error } = useGreeceTotalApplications()
  return <AsylumApplicationsEvolutionInGreeceDetails records={records} loading={loading} error={error} customText={customText} />
}
