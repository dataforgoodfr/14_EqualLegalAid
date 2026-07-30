import { Outlet, NavLink, useLocation } from 'react-router-dom'

import { HeaderComponent } from '@/components/Header'
import { KeyFiguresHeader } from '@/components/Indicators/KeyFiguresHeader'
import { MethodologySection } from '@/components/Indicators/MethodologySection'
import { HighlightTitle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useKeyFigures } from '@/hooks/useKeyFigures'
import { useIndicatorCustomTexts } from '@/hooks/useIndicatorCustomTexts'
import { useEmbedMode } from '@/hooks/useEmbedMode'
import { useTranslation } from 'react-i18next'
import asylumDataHero from '@/assets/refugee-camp-diavata.jpg'
interface NavLinkItem {
  label: string
  to: string
}
export const StatisticLayoutPage = () => {
  const { records: customTexts } = useIndicatorCustomTexts()
  const keyFigures = useKeyFigures()
  const isEmbed = useEmbedMode()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'
  const asylumApplicationsInEuropeanUnion = customTexts.filter(ct => ct.name === 'AsylumApplicationsInEuropeanUnion')[0] ?? null
  const asylumApplicationsInEurope = customTexts.filter(ct => ct.name === 'AsylumApplicationsInEurope')[0] ?? null
  const arrivalsInGreece = customTexts.filter(ct => ct.name === 'ArrivalsInGreece')[0] ?? null
  const asylumSeekersCamps = customTexts.filter(ct => ct.name === 'AsylumSeekersLivingInCamps')[0] ?? null
  const asylumApplicationsEvolutionInGreece = customTexts.filter(ct => ct.name === 'AsylumApplicationsEvolutionInGreece')[0] ?? null
  const protectionGrantedVsRejected = customTexts.filter(ct => ct.name === 'ProtectionGrantedVsRejected')[0] ?? null
  const recognitionRates = customTexts.filter(ct => ct.name === 'RecognitionRates')[0] ?? null
  const courtAsylumProcedures = customTexts.filter(ct => ct.name === 'CourtAsylumProcedures')[0] ?? null

  const getCustomText = (name: string) => customTexts.find(ct => ct.name === name) ?? null

  const tabItems: NavLinkItem[] = [
    { label: (isGr ? asylumApplicationsInEuropeanUnion?.title_gr : asylumApplicationsInEuropeanUnion?.title_en) || t('statistics.fluctuationsAsylumApplicationsEu'), to: 'AsylumApplicationsInEuropeanUnion' },
    { label: (isGr ? asylumApplicationsInEurope?.title_gr : asylumApplicationsInEurope?.title_en) || t('statistics.euAsylumApplications'), to: 'AsylumApplicationsInEurope' },
    { label: (isGr ? arrivalsInGreece?.title_gr : arrivalsInGreece?.title_en) || t('statistics.arrivalsGreece'), to: 'ArrivalsInGreece' },
    { label: (isGr ? asylumSeekersCamps?.title_gr : asylumSeekersCamps?.title_en) || t('statistics.asylumSeekersCamps'), to: 'AsylumSeekersCamps' },
    { label: (isGr ? asylumApplicationsEvolutionInGreece?.title_gr : asylumApplicationsEvolutionInGreece?.title_en) || t('statistics.asylumEvolutionGreece'), to: 'AsylumApplicationsEvolutionInGreece' },
    { label: (isGr ? protectionGrantedVsRejected?.title_gr : protectionGrantedVsRejected?.title_en) || t('statistics.firstSecondInstanceDecisionsGreece'), to: 'ProtectionGrantedVsRejected' },
    { label: (isGr ? courtAsylumProcedures?.title_gr : courtAsylumProcedures?.title_en) || t('statistics.courtAsylumProcedures'), to: 'CourtAsylumProcedures' },
    { label: (isGr ? recognitionRates?.title_gr : recognitionRates?.title_en) || t('statistics.overallProtectionRate'), to: 'RecognitionRates' },
  ]
  return (
    <div className="app mx-auto my-0 w-full xl:max-w-315">
      {!isEmbed && <HeaderComponent />}
      <main className="main-content px-4 xl:px-0">
        <div className="relative left-1/2 -ml-[50vw] w-screen">
          <img
            src={asylumDataHero}
            alt=""
            className="h-[240px] w-full object-cover object-[50%_70%] xl:h-[500px]"
          />
          <div className="absolute bottom-10 left-0 w-full pl-[5%] xl:bottom-[72px]">
            <h1 className="max-w-[800px]">
              <span className="font-gotham bg-[#093266] px-5 text-[32px] font-extrabold uppercase leading-tight tracking-[0.3px] text-white xl:text-[48px] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                {t('nav.statistics')}
              </span>
            </h1>
          </div>
          <p className="absolute bottom-1 right-2 text-[10px] text-white/80 xl:bottom-2 xl:right-4 xl:text-xs">
            {t('statistics.photoCredit')}
          </p>
        </div>
        {(isGr ? keyFigures.title_gr : keyFigures.title_en) && (
          <HighlightTitle title={isGr ? keyFigures.title_gr : keyFigures.title_en} />
        )}
        <KeyFiguresHeader data={keyFigures} />
        <div className="flex flex-wrap gap-2 border-b border-gray-200 px-1 py-3">
          {tabItems.map(tabItem => (
            <NavLink
              to={{ pathname: tabItem.to, search: location.search }}
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
        <MethodologySection customText={getCustomText('Methodology')} />
      </main>
    </div>
  )
}
