import { useOutletContext } from 'react-router'
import { AsylumApplicationsEvolutionInGreece } from '@/components/Indicators/AsylumApplicationsEvolutionInGreece'
import type { StatisticOutletContext } from '@/types'

export default function AsylumApplicationsEvolutionInGreecePage(){
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <AsylumApplicationsEvolutionInGreece customText={getCustomText('AsylumApplicationsEvolutionInGreece')} />
  )
}
