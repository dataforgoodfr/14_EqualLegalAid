import type { Caselaw } from '@/types'
import { downloadPdf } from '@/utils/pdfHelpers'
import { Button } from '@/components/ui'
import { Download } from 'lucide-react'

interface CaselawCardProps {
  caselaw: Caselaw
}

const OUTCOME_COLORS: Record<string, string> = {
  'Refugee Status granted': 'var(--color-outcome-accepted)',
  'Subsidiary Protection granted': 'var(--color-outcome-accepted)',
  'Application accepted': 'var(--color-outcome-accepted)',
  'Accepted: Remittal for new examination': 'var(--color-outcome-partial)',
  'Application partially accepted': 'var(--color-outcome-partial)',
  'Admissible': 'var(--color-outcome-partial)',
  'Examination on the merits - Hearing of the applicant': 'var(--color-outcome-neutral)',
  'Application rejected': 'var(--color-outcome-rejected)',
  'Inadmissible': 'var(--color-outcome-rejected)',
}

export const CaselawCard = ({ caselaw }: CaselawCardProps) => {
  const outcomeColor = OUTCOME_COLORS[caselaw.caselawOutcome] ?? 'var(--color-outcome-neutral)'
  console.log('caselaw', caselaw)

  const formattedDate = caselaw.publishedAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,46,93,0.08)]">

      {/* Body */}
      <div className="flex min-w-0 flex-col gap-3 p-5 px-6">

        {/* Outcome badge */}
        <span
          className="self-start rounded-[20px] px-[0.65rem] py-[0.3rem] text-[0.72rem] font-semibold tracking-[0.4px] whitespace-nowrap text-white uppercase"
          style={{ backgroundColor: outcomeColor }}
        >
          {caselaw.caselawOutcome || 'Unknown Status'}
        </span>

        {/* Title */}
        <h3 className="m-0 text-base leading-[1.35] font-semibold text-[var(--primary-color)]">
          {caselaw.title || 'Untitled Case'}
        </h3>

        {/* Published + Country — same line */}
        <div className="flex flex-wrap gap-5">
          <span className="flex flex-col gap-0.5">
            <span className="text-[0.7rem] font-normal tracking-[0.6px] text-[var(--text-light)] uppercase">Published</span>
            <span className="text-[0.88rem] font-medium text-[var(--text-secondary)]">{formattedDate}</span>
          </span>
          {caselaw.countryOfOrigin && (
            <span className="flex flex-col gap-0.5">
              <span className="text-[0.7rem] font-normal tracking-[0.6px] text-[var(--text-light)] uppercase">Country</span>
              <span className="text-[0.88rem] font-medium text-[var(--text-secondary)]">{caselaw.countryOfOrigin}</span>
            </span>
          )}
        </div>

        {/* Court */}
        {caselaw.competentCourtOrAuthority && (
          <span className="flex flex-col gap-0.5">
            <span className="text-[0.7rem] font-normal tracking-[0.6px] text-[var(--text-light)] uppercase">Court</span>
            <span className="text-[0.88rem] font-medium text-[var(--text-secondary)]">{caselaw.competentCourtOrAuthority}</span>
          </span>
        )}

        {/* Application */}
        {caselaw.competentCourtOrAuthority && (
          <span className="flex flex-col gap-0.5">
            <span className="text-[0.7rem] font-normal tracking-[0.6px] text-[var(--text-light)] uppercase">Application</span>
            <span className="text-[0.88rem] font-medium text-[var(--text-secondary)]">{caselaw.applicationTypes || ''}</span>
          </span>
        )}

        {/* Asylum Procedure */}
        {caselaw.asylumProcedure && (
          <span className="flex flex-col gap-0.5">
            <span className="text-[0.7rem] font-normal tracking-[0.6px] text-[var(--text-light)] uppercase">Asylum Procedure</span>
            <span className="text-[0.88rem] font-medium text-[var(--text-secondary)]">{caselaw.asylumProcedure}</span>
          </span>
        )}

        {/* Keywords */}
        {caselaw.keywords.length > 0 && (
          <div className="flex flex-wrap gap-[0.4rem] pr-[25%]">
            {caselaw.keywords.map(keyword => (
              <span
                key={keyword}
                className="rounded-[12px] bg-black px-[0.55rem] py-[0.2rem] text-[0.72rem] font-medium text-white"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        {/* PDF actions — always visible, disabled when no link */}
        <div className="flex justify-end gap-2 pt-1">
          <Button
            size="xs"
            disabled={!caselaw.englishPdfLink}
            className="border border-black bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.1)] hover:-translate-y-px hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => caselaw.englishPdfLink && downloadPdf(caselaw.englishPdfLink)}
            title="Download English PDF"
          >
            <Download size={12} />
            Download English PDF
          </Button>
          <Button
            size="xs"
            disabled={!caselaw.greekPdfLink}
            className="border border-black bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.1)] hover:-translate-y-px hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => caselaw.greekPdfLink && downloadPdf(caselaw.greekPdfLink)}
            title="Download Greek PDF"
          >
            <Download size={12} />
            Download Greek PDF
          </Button>
        </div>

      </div>
    </article>
  )
}
