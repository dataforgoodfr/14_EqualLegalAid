import { Outlet } from 'react-router-dom'

import { HeaderComponent } from '@/components/Header'
import { KeyFiguresBand } from '@/components/Indicators/KeyFiguresBand'
import { MethodologySection } from '@/components/Indicators/MethodologySection'
import { IndicatorNav, type IndicatorItem } from '@/components/Layout/IndicatorNav'
import { useKeyFigures } from '@/hooks/useKeyFigures'
import { useIndicatorCustomTexts } from '@/hooks/useIndicatorCustomTexts'
import { useEmbedMode } from '@/hooks/useEmbedMode'
import { useTranslation } from 'react-i18next'
import asylumDataHero from '@/assets/refugee-camp-diavata.jpg'

export const StatisticLayoutPage = () => {
  const { records: customTexts } = useIndicatorCustomTexts()
  const keyFigures = useKeyFigures()
  const isEmbed = useEmbedMode()
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

  // Les groupes sont portés par la donnée : ajouter un indicateur ne demande pas
  // de toucher au balisage de la navigation. L'ordre de cette liste fixe à la fois
  // l'ordre des groupes et celui des pastilles.
  const tabItems: IndicatorItem[] = [
    { group: 'europe', label: (isGr ? asylumApplicationsInEuropeanUnion?.title_gr : asylumApplicationsInEuropeanUnion?.title_en) || t('statistics.fluctuationsAsylumApplicationsEu'), to: 'AsylumApplicationsInEuropeanUnion' },
    { group: 'europe', label: (isGr ? asylumApplicationsInEurope?.title_gr : asylumApplicationsInEurope?.title_en) || t('statistics.euAsylumApplications'), to: 'AsylumApplicationsInEurope' },
    { group: 'greeceFlows', label: (isGr ? arrivalsInGreece?.title_gr : arrivalsInGreece?.title_en) || t('statistics.arrivalsGreece'), to: 'ArrivalsInGreece' },
    { group: 'greeceFlows', label: (isGr ? asylumSeekersCamps?.title_gr : asylumSeekersCamps?.title_en) || t('statistics.asylumSeekersCamps'), to: 'AsylumSeekersCamps' },
    { group: 'greeceFlows', label: (isGr ? asylumApplicationsEvolutionInGreece?.title_gr : asylumApplicationsEvolutionInGreece?.title_en) || t('statistics.asylumEvolutionGreece'), to: 'AsylumApplicationsEvolutionInGreece' },
    { group: 'decisions', label: (isGr ? protectionGrantedVsRejected?.title_gr : protectionGrantedVsRejected?.title_en) || t('statistics.firstSecondInstanceDecisionsGreece'), to: 'ProtectionGrantedVsRejected' },
    { group: 'decisions', label: (isGr ? courtAsylumProcedures?.title_gr : courtAsylumProcedures?.title_en) || t('statistics.courtAsylumProcedures'), to: 'CourtAsylumProcedures' },
    { group: 'decisions', label: (isGr ? recognitionRates?.title_gr : recognitionRates?.title_en) || t('statistics.overallProtectionRate'), to: 'RecognitionRates' },
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
              <span className="font-gotham bg-[#003366] px-5 text-[32px] font-extrabold uppercase leading-tight tracking-[0.3px] text-white xl:text-[48px] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                {t('nav.statistics')}
              </span>
            </h1>
          </div>
          <p className="absolute bottom-1 right-2 text-[10px] text-white/80 xl:bottom-2 xl:right-4 xl:text-xs">
            {t('statistics.photoCredit')}
          </p>
        </div>
        <KeyFiguresBand data={keyFigures} />
        <div className="pt-6">
          <IndicatorNav items={tabItems} groupLabel={g => t(`statistics.group.${g}`)} />
        </div>
        <Outlet context={{ customTexts, getCustomText }} />
        <MethodologySection customText={getCustomText('Methodology')} />
      </main>
    </div>
  )
}
