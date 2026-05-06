import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { useArrivalsGreece } from '@/hooks/useArrivalsGreece'
import { ArrivalsGreeceDetails } from './ArrivalsGreeceDetails'

export function ArrivalsGreece({ customText }: { customText?: IndicatorCustomText | null }) {
  const { records, loading, error } = useArrivalsGreece()
  return <ArrivalsGreeceDetails records={records} loading={loading} error={error} customText={customText} />
}
