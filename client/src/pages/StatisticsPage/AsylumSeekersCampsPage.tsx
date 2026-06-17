import { useOutletContext } from 'react-router'
import { AsylumSeekersCamps } from '@/components/Indicators/AsylumSeekersCamps'
import type { StatisticOutletContext } from '@/types'

export default function ApplicationsEvolutionGreecePage(){
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <AsylumSeekersCamps customText={getCustomText('AsylumSeekersCamps')} />
  )
}
