import { useOutletContext } from 'react-router-dom'
import { EuropeRegionMap } from '@/components/Indicators/EuropeRegionMap'
import type { StatisticOutletContext } from '@/types'

export const AsylumApplicationsInEuropePage = () => {
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <EuropeRegionMap customText={getCustomText('AsylumApplicationsInEurope')} />
  )
}
