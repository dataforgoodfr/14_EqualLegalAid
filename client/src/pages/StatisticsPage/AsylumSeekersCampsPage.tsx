import { useOutletContext } from 'react-router-dom'
import { AsylumSeekersCamps } from '@/components/Indicators/AsylumSeekersCamps'
import type { StatisticOutletContext } from '@/types'

export const AsylumSeekersCampsPage = () => {
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <AsylumSeekersCamps customText={getCustomText('AsylumSeekersCamps')} />
  )
}
