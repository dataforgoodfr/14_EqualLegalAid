import { AsylumApplicationsDetails } from '@/components/Indicators/AsylumApplicationsDetails'
import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'

export function AsylumApplications({ customText }: { customText?: IndicatorCustomText | null }) {
  const { records, loading, error } = useAsylumApplications()
  return <AsylumApplicationsDetails records={records} loading={loading} error={error} customText={customText} />
}
