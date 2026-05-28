import { useOutletContext } from 'react-router-dom'
import { AsylumApplicationsEvolutionInGreece } from '@/components/Indicators/AsylumApplicationsEvolutionInGreece'
import type { StatisticOutletContext } from '@/types'

export const AsylumApplicationsEvolutionInGreecePage = () => {
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <AsylumApplicationsEvolutionInGreece customText={getCustomText('AsylumApplicationsEvolutionInGreece')} />
  )
}
