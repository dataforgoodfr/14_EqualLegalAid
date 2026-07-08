import { useOutletContext } from 'react-router'
import { AsylumSeekersCamps } from '@/components/Indicators/AsylumSeekersCamps'
import type { StatisticOutletContext } from '@/types'

export default () => {
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <AsylumSeekersCamps customText={getCustomText('AsylumSeekersCamps')} />
  )
}
