import { useTranslation } from 'react-i18next'
import { CircleFlag } from 'react-circle-flags'
import { LANGUAGES } from '@/i18n/i18n'
import { cn } from '@/lib/utils'

const LANG_COUNTRY: Record<string, string> = {
  en: 'gb',
  el: 'gr',
}

interface LanguageSwitcherProps {
  className?: string
}
export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {Object.values(LANGUAGES).map((lang) => (
        <button
          onClick={() => i18n.changeLanguage(lang)}
          key={lang}
          className={cn(
            'transition-opacity cursor-pointer',
            currentLang === lang ? 'opacity-100' : 'opacity-40 hover:opacity-70',
          )}
          aria-label={`Switch to ${lang}`}
        >
          <CircleFlag countryCode={LANG_COUNTRY[lang] ?? lang} style={{ width: '20px', height: '20px' }} />
        </button>
      ))}
    </div>
  )
}
