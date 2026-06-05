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

  const handleSelecteItem = () => {
    const selected = !isCardSelected
    if (!isDownloadMode) {
      return
    }
    setIsCardSelected(selected)
    const selectedObject: SelectedCaselawItem = {
      id: caselaw.title,
      pdf: {
        pdfFileName: caselaw.englishPdfLink.pdfFileName,
        pdfURL: caselaw.englishPdfLink.pdfURL,
      },
    }
    setCaselawSelection(selectedObject, selected)
  }
  return (
    <article
      className={cn(
        'w-auto overflow-hidden rounded-xl  bg-white shadow-[0_2px_12px_rgba(0,46,93,0.08)] transition-all p-5',
        isDownloadMode && 'cursor-pointer border-2 border-input',
        isDownloadMode && isSelected(caselaw.title) && 'border-black bg-input',
      )}
      onClick={handleSelecteItem}
    >
      <Badge
        label={lang(caselaw.caselawOutcome, caselaw.caselawOutcome_GR) || t('caselaw.unknownStatus')}
        color={outcomeColor}
        className="mb-6"
        displayPicto
      />
      {/* Partie haute de la carte titre + tag */}
      <div className="flex flex-wrap items-start">
        {/* Accepted / Rejected + Titre + Date + proceeding */}
        <div className="w-full border-b pb-4 xl:w-2/3 xl:border-r xl:border-b-0">
          <CardTitle
            title={`${lang(caselaw.competentCourtOrAuthority, caselaw.competentCourtOrAuthority_GR)}`}
            subtitle={`${caselaw.title}`}
            className="mb-4"
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
        <div className="w-full pt-6 xl:w-1/3 xl:pt-0 xl:pl-6">
          <div className="flex w-full flex-wrap overflow-hidden xl:items-end xl:justify-end">
            <CountryBadge
              label={lang(caselaw.countryOfOrigin, caselaw.countryOfOrigin_GR)}
              countryOfOrigin={caselaw.countryOfOrigin}
              className="mb-2 not-last:mr-2"
            />
            {lang(caselaw.keywords, caselaw.keywords_GR).map(keyword => (
              <Badge
                color="#F5F5F5"
                fontColor="#111113"
                key={keyword}
                label={keyword}
                className="mb-2 not-last:mr-2"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Partie basse de la carte bouton téléchargement */}
      <div className="mt-6 flex flex-wrap justify-end">
        {caselaw.englishPdfLink.pdfURL.length && (
          <Button
            size="sm"
            variant="outline"
            asChild
            className="mb-4 w-full xl:mb-0 xl:w-auto"
          >
            <a
              href={caselaw.englishPdfLink.pdfURL}
              target="_blank"
            >
              <Download size={16} />
              {t('caselaw.downloadEnglishPdf')}
            </a>
          </Button>
        )}
        {caselaw.greekPdfLink.pdfURL.length && (
          <Button
            size="sm"
            variant="outline"
            asChild
            className="w-full xl:ml-4 xl:w-auto"
          >
            <a
              href={caselaw.greekPdfLink.pdfURL}
              target="_blank"
            >
              <Download size={16} />
              {t('caselaw.downloadGreekPdf')}
            </a>
          </Button>
        )}
      </div>
    </article>
  )
}
