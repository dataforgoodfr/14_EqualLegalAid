import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
interface LanguageSwitcherProps {
  className?: string
}
export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation()
  const { t } = useTranslation()
  const currentLang = i18n.language

  return (
    <div className={cn(
      'flex items-center',
      className,
    )}
    >
      {Object.values(LANGUAGES).map((lang, index) => (
        <button
          onClick={() => i18n.changeLanguage(lang)}
          key={lang}
          className={cn(
            'text-sm tracking-widest uppercase transition-all font-medium text-gray-700 not-last:mr-3 hover:text-blue-france cursor-pointer',
            { 'text-blue-france': currentLang === lang },
          )}
          aria-label={`Switch to ${lang}`}
        >
          {t(`header.langSwitcher.${lang}`)}
          {index < Object.values(LANGUAGES).length - 1 && (
            <span className="ml-3 inline-block text-sm font-light text-gray-700">|</span>
          )}
        </button>
      ))}
    </div>
  )
}
