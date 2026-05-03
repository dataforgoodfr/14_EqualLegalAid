import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { useAsylumSeekersCamps } from '@/hooks/useAsylumSeekersCamps'
import { AsylumSeekersCampsDetails } from './AsylumSeekersCampsDetails'

export function AsylumSeekersCamps({ customText }: { customText?: IndicatorCustomText | null }) {
  const { records, loading, error } = useAsylumSeekersCamps()
  return <AsylumSeekersCampsDetails records={records} loading={loading} error={error} customText={customText} />
}
