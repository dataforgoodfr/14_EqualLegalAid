import { useOutletContext } from 'react-router'
import { ArrivalsGreece } from '@/components/Indicators/ArrivalsGreece'
import type { StatisticOutletContext } from '@/types'

export default () => {
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <ArrivalsGreece customText={getCustomText('ArrivalsInGreece')} />
  )
}
