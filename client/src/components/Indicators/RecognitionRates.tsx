import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { useRecognitionRates } from '@/hooks/useRecognitionRates'
import { RecognitionRatesDetails } from './RecognitionRatesDetails'

export function RecognitionRates({ customText }: { customText?: IndicatorCustomText | null }) {
  const { records, loading, error } = useRecognitionRates()
  return <RecognitionRatesDetails records={records} loading={loading} error={error} customText={customText} />
}
