import { useState } from 'react'
import type { Caselaw, SelectedCaselawItem } from '@/types'
import { Badge, Button, CardInfo, CardTitle, CountryBadge } from '@/components/ui'
import { Download } from 'lucide-react'
import { useDownloadCaselaw } from '@/context/'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
interface CaselawCardProps {
  caselaw: Caselaw
}

const OUTCOME_COLORS: Record<string, string> = {
  'Refugee Status granted': 'var(--color-outcome-accepted)',
  'Subsidiary Protection granted': 'var(--color-outcome-accepted)',
  'Application accepted': 'var(--color-outcome-accepted)',
  'Accepted: Remittal for new examination': 'var(--color-outcome-accepted)',
  'Application partially accepted': 'var(--color-outcome-accepted)',
  'Admissible': 'var(--color-outcome-accepted)',
  'Examination on the merits - Hearing of the applicant': 'var(--color-outcome-neutral)',
  'Application rejected': 'var(--color-outcome-rejected)',
  'Inadmissible': 'var(--color-outcome-rejected)',
}

export const CaselawCard = ({ caselaw }: CaselawCardProps) => {
  const { t, i18n } = useTranslation()
  const isGreek = i18n.language === 'el'
  const lang = <T,>(en: T, gr: T): T => (isGreek ? gr : en)

  // Colour map is keyed by English values regardless of display language
  const outcomeColor = OUTCOME_COLORS[caselaw.caselawOutcome] ?? 'var(--color-outcome-neutral)'
  const locale = isGreek ? 'el-GR' : 'en-GB'
  const formattedDate = caselaw.publishedAt.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const { setCaselawSelection, isSelected, isDownloadMode } = useDownloadCaselaw()
  const [isCardSelected, setIsCardSelected] = useState(isSelected(caselaw.title))

  // Limite le nombre de keywords affichés pour garder des cartes de hauteur
  // homogène ; les keywords restants sont dépliables via le badge « +N ».
  const MAX_VISIBLE_KEYWORDS = 4
  const [showAllKeywords, setShowAllKeywords] = useState(false)
  const keywordList = lang(caselaw.keywords, caselaw.keywords_GR)
  const visibleKeywords = showAllKeywords ? keywordList : keywordList.slice(0, MAX_VISIBLE_KEYWORDS)
  const hiddenKeywordsCount = keywordList.length - MAX_VISIBLE_KEYWORDS
  const handleSelecteItem = () => {
    const selected = !isCardSelected
    if (!isDownloadMode) {
      return
    }
    setIsCardSelected(selected)
    const selectedObject: SelectedCaselawItem = {
      id: caselaw.title,
      pdfEN: {
        pdfFileName: caselaw.englishPdfLink.pdfFileName,
        pdfURL: caselaw.englishPdfLink.pdfURL,
      },
      pdfGR: {
        pdfFileName: caselaw.greekPdfLink.pdfFileName,
        pdfURL: caselaw.greekPdfLink.pdfURL,
      },
    }
    setCaselawSelection(selectedObject, selected)
  }
  return (
    <article
      className={cn(
        'w-auto overflow-hidden rounded-xl  bg-white shadow-[0_2px_12px_rgba(0,46,93,0.08)] transition-all p-4',
        isDownloadMode && 'cursor-pointer border-2 border-input',
        isDownloadMode && isSelected(caselaw.title) && 'border-black bg-input',
      )}
      onClick={handleSelecteItem}
    >
      {/* Outcome badge + boutons PDF sur la même ligne en haut */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <Badge
          label={lang(caselaw.caselawOutcome, caselaw.caselawOutcome_GR) || t('caselaw.unknownStatus')}
          color={outcomeColor}
          displayPicto
        />
        <div className="flex flex-wrap gap-2">
          {caselaw.englishPdfLink.pdfURL.length && (
            <Button
              variant="outline"
              asChild
              className="!h-auto !py-1 !px-2.5 !text-[0.72rem] !rounded-3xl !gap-1 !font-medium !tracking-[0.4px] w-full xl:w-auto"
            >
              <a
                href={caselaw.englishPdfLink.pdfURL}
                target="_blank"
              >
                <Download size={12} />
                {t('caselaw.downloadEnglishPdf')}
              </a>
            </Button>
          )}
          {caselaw.greekPdfLink.pdfURL.length && (
            <Button
              variant="outline"
              asChild
              className="!h-auto !py-1 !px-2.5 !text-[0.72rem] !rounded-3xl !gap-1 !font-medium !tracking-[0.4px] w-full xl:w-auto"
            >
              <a
                href={caselaw.greekPdfLink.pdfURL}
                target="_blank"
              >
                <Download size={12} />
                {t('caselaw.downloadGreekPdf')}
              </a>
            </Button>
          )}
        </div>
      </div>
      {/* Partie haute de la carte titre + tag */}
      <div className="flex flex-wrap items-start">
        {/* Accepted / Rejected + Titre + Date + proceeding */}
        <div className="w-full border-b pb-4 xl:w-3/5 xl:border-r xl:border-b-0">
          <CardTitle
            title={`${lang(caselaw.competentCourtOrAuthority, caselaw.competentCourtOrAuthority_GR)}`}
            subtitle={`${caselaw.title}`}
            className="mb-3"
          />
          <CardInfo
            label={`${t('caselaw.date')} :`}
            className="mb-2"
            value={`${formattedDate}`}
          />
          {/* Type of Proceeding */}
          {caselaw.legalProcedureTypes && (
            <CardInfo
              label={`${t('caselaw.procedureType')} :`}
              className="mb-2"
              value={lang(caselaw.legalProcedureTypes, caselaw.legalProcedureTypes_GR)}
            />
          )}

          {/* Asylum Procedure */}
          {caselaw.asylumProcedure && (
            <CardInfo
              label={`${t('caselaw.asylumProcedure')} :`}
              value={`${lang(caselaw.applicationTypes, caselaw.applicationTypes_GR)}, ${lang(caselaw.asylumProcedure, caselaw.asylumProcedure_GR)}`}
            />
          )}
        </div>
        {/* Tag */}
        <div className="w-full pt-4 xl:w-2/5 xl:pt-0 xl:pl-6">
          <div className="flex w-full flex-wrap overflow-hidden xl:items-start xl:justify-start">
            <CountryBadge
              label={lang(caselaw.countryOfOrigin, caselaw.countryOfOrigin_GR)}
              countryOfOrigin={caselaw.countryOfOrigin}
              className="mb-2 not-last:mr-2"
            />
            {visibleKeywords.map(keyword => (
              <Badge
                color="#F5F5F5"
                fontColor="#111113"
                key={keyword}
                label={keyword}
                className="mb-2 not-last:mr-2"
              />
            ))}
            {hiddenKeywordsCount > 0 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setShowAllKeywords(prev => !prev)
                }}
                className="mb-2 not-last:mr-2 flex w-fit cursor-pointer items-center rounded-3xl bg-[#E5E5E5] px-2.5 py-1 text-[0.72rem] font-medium tracking-[0.4px] text-[#111113] hover:bg-[#d8d8d8]"
              >
                {showAllKeywords ? '−' : `+${hiddenKeywordsCount}`}
              </button>
            )}
          </div>
        </div>
      </div>


    </article>
  )
}
