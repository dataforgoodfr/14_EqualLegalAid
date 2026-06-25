import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import elaAvatar from '@/assets/ela.png'

export function MethodologySection({ customText }: { customText?: IndicatorCustomText | null }) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'
  const [expanded, setExpanded] = useState(false)

  if (!customText) return null

  const title = (isGr ? customText.title_gr : customText.title_en) || ''
  const subtitle = (isGr ? customText.subtitle_gr : customText.subtitle_en) || ''
  const explanatoryText = (isGr ? customText.explanatory_text_gr : customText.explanatory_text_en) || ''
  const information = (isGr ? customText.information_gr : customText.information_en) || ''

  if (!title && !subtitle && !explanatoryText && !information) return null

  const displayText = expanded ? information : explanatoryText

  return (
    <div className="mx-auto my-10 max-w-5xl">
      <div className="relative overflow-hidden rounded-xl border border-[#C4B5E3] bg-white p-8">
        <img
          src={elaAvatar}
          alt=""
          className="absolute top-6 right-6 h-16 w-16 rounded-full object-cover"
        />

        <div className="pr-24">
          {title && (
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{title}</h2>
          )}

          {subtitle && (
            <p className="mb-4 text-sm font-bold text-gray-900">{subtitle}</p>
          )}

          {displayText && (
            <div className="mb-6 space-y-4 text-sm leading-relaxed text-gray-600">
              {displayText.split('\n').filter(Boolean).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          {information && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="rounded-full border border-gray-300 bg-gray-50 px-5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
            >
              {expanded ? t('statistics.lessInformation') : t('statistics.moreInformation')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
