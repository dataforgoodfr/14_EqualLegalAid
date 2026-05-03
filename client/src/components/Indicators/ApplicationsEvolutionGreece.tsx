import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { useApplicationsEvolution } from '@/hooks/useApplicationsEvolution'
import { ApplicationsEvolutionGreeceDetails } from './ApplicationsEvolutionGreeceDetails'

export function ApplicationsEvolutionGreece({ customText }: { customText?: IndicatorCustomText | null }) {
  const { records, loading, error } = useApplicationsEvolution()
  return <ApplicationsEvolutionGreeceDetails records={records} loading={loading} error={error} customText={customText} />
}
