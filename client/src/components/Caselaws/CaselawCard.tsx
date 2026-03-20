import type { Caselaw } from '@/types'
import { downloadPdf } from '@/utils/pdfHelpers'
import { Badge, Button, CardInfo, CardTitle } from '@/components/ui'
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
        <Badge
          label={caselaw.caselawOutcome || 'Unknown Status'}
          color={outcomeColor}
          uppercase
        />

        {/* Title */}
        <CardTitle title={caselaw.title || 'Untitled Case'} />

        {/* Published + Country — same line */}
        <div className="flex flex-wrap gap-5">
          <CardInfo title="Published" info={formattedDate} />
          {caselaw.countryOfOrigin && <CardInfo title="Country" info={caselaw.countryOfOrigin} />}
        </div>

        {/* Court */}
        {caselaw.competentCourtOrAuthority && <CardInfo title="Court" info={caselaw.competentCourtOrAuthority} />}

        {/* Application */}
        {caselaw.competentCourtOrAuthority && <CardInfo title="Application" info={caselaw.applicationTypes || ''} />}

        {/* Asylum Procedure */}
        {caselaw.asylumProcedure && <CardInfo title="Asylum Procedure" info={caselaw.asylumProcedure} />}

        {/* Keywords */}
        {caselaw.keywords.length > 0 && (
          <div className="flex flex-wrap gap-[0.4rem] pr-[25%]">
            {caselaw.keywords.map(keyword => (
              <Badge key={keyword} label={keyword} />
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
