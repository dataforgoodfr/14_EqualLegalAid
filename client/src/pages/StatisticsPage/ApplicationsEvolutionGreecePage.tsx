import { useOutletContext } from 'react-router'
import { ApplicationsEvolutionGreece } from '@/components/Indicators/ApplicationsEvolutionGreece'
import type { StatisticOutletContext } from '@/types'

export const ApplicationsEvolutionGreecePage = () => {
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <ApplicationsEvolutionGreece customText={getCustomText('ApplicationsEvolutionGreece')} />
  )
}
