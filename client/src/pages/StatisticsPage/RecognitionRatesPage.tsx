import { useOutletContext } from 'react-router-dom'
import { RecognitionRates } from '@/components/Indicators/RecognitionRates'
import type { StatisticOutletContext } from '@/types'

export const RecognitionRatesPage = () => {
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <RecognitionRates customText={getCustomText('RecognitionRates')} />
  )
}
