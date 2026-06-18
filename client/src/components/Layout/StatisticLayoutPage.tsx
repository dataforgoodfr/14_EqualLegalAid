import { Outlet, NavLink } from 'react-router-dom'

import { HeaderComponent } from '@/components/Header'
import { KeyFiguresHeader } from '@/components/Indicators/KeyFiguresHeader'
import { cn } from '@/lib/utils'
import { useKeyFigures } from '@/hooks/useKeyFigures'
import { useIndicatorCustomTexts } from '@/hooks/useIndicatorCustomTexts'
import { useTranslation } from 'react-i18next'
interface NavLinkItem {
  label: string
  to: string
}
export const StatisticLayoutPage = () => {
  const { records: customTexts } = useIndicatorCustomTexts()
  const keyFigures = useKeyFigures()
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'
  const asylumApplicationsInEurope = customTexts.filter(ct => ct.name === 'AsylumApplicationsInEurope')[0] ?? null
  const asylumApplicationsInEuropeanUnion = customTexts.filter(ct => ct.name === 'AsylumApplicationsInEuropeanUnion')[0] ?? null
  const arrivalsInGreece = customTexts.filter(ct => ct.name === 'ArrivalsInGreece')[0] ?? null
  const asylumSeekersCamps = customTexts.filter(ct => ct.name === 'AsylumSeekersLivingInCamps')[0] ?? null
  const asylumApplicationsEvolutionInGreece = customTexts.filter(ct => ct.name === 'AsylumApplicationsEvolutionInGreece')[0] ?? null
  const protectionGrantedVsRejected = customTexts.filter(ct => ct.name === 'ProtectionGrantedVsRejected')[0] ?? null

  const getCustomText = (name: string) => customTexts.find(ct => ct.name === name) ?? null

  const tabItems: NavLinkItem[] = [
    { label: (isGr ? asylumApplicationsInEurope?.title_gr : asylumApplicationsInEurope?.title_en) || t('statistics.euAsylumApplications'), to: 'AsylumApplicationsInEurope' },
    { label: (isGr ? asylumApplicationsInEuropeanUnion?.title_gr : asylumApplicationsInEuropeanUnion?.title_en) || t('statistics.euAsylumApplications'), to: 'AsylumApplicationsInEuropeanUnion' },
    { label: (isGr ? arrivalsInGreece?.title_gr : arrivalsInGreece?.title_en) || t('statistics.arrivalsGreece'), to: 'ArrivalsInGreece' },
    { label: (isGr ? asylumApplicationsEvolutionInGreece?.title_gr : asylumApplicationsEvolutionInGreece?.title_en) || t('statistics.asylumEvolutionGreece'), to: 'AsylumApplicationsEvolutionInGreece' },
    { label: (isGr ? protectionGrantedVsRejected?.title_gr : protectionGrantedVsRejected?.title_en) || t('statistics.protectionDecisions'), to: 'ProtectionGrantedVsRejected' },
    { label: (isGr ? asylumSeekersCamps?.title_gr : asylumSeekersCamps?.title_en) || t('statistics.asylumSeekersCamps'), to: 'AsylumSeekersCamps' },
    // {label: (isGr ? applicationsEvolutionGreece?.title_gr : applicationsEvolutionGreece?.title_en) || t('statistics.applicationsEvolutionGreece'), to: 'ApplicationsEvolutionGreece'},
    // {label: (isGr ? recognitionRates?.title_gr : recognitionRates?.title_en) || t('statistics.recognitionRates'), to: 'RecognitionRates'}
  ]
  return (
    <div className="app mx-auto my-0 w-full xl:max-w-315">
      <HeaderComponent />
      <main className="main-content px-4 xl:px-0">
        <KeyFiguresHeader data={keyFigures} />
        <div className="flex flex-wrap gap-2 border-b border-gray-200 px-1 py-3">
          {tabItems.map(tabItem => (
            <NavLink
              to={tabItem.to}
              key={tabItem.to}
              className={({ isActive }: { isActive: boolean }) => cn(
                'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                { 'bg-[#04356C] text-white': isActive },
              )}
            >
              {tabItem.label}
            </NavLink>
          ))}
        </div>
        <Outlet context={{ customTexts, getCustomText }} />
      </main>
    </div>
  )
}
