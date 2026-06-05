import { useOutletContext } from 'react-router-dom'
import { ArrivalsGreece } from '@/components/Indicators/ArrivalsGreece'
import type { StatisticOutletContext } from '@/types'

export const ArrivalsInGreecePage = () => {
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <ArrivalsGreece customText={getCustomText('ArrivalsInGreece')} />
  )
}
