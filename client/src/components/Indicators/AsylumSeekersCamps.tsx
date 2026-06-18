import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { useAsylumSeekersCamps } from '@/hooks/useAsylumSeekersCamps'
import { AsylumSeekersCampsDetails } from './AsylumSeekersCampsDetails'

export function AsylumSeekersCamps({ customText }: { customText?: IndicatorCustomText | null }) {
  const { records, locations, loading, error } = useAsylumSeekersCamps()
  return <AsylumSeekersCampsDetails records={records} locations={locations} loading={loading} error={error} customText={customText} />
}
