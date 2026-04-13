import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/i18n/i18n'

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => i18n.changeLanguage(LANGUAGES.en)}
        className={[
          'text-sm tracking-widest uppercase transition-all',
          currentLang === LANGUAGES.en
            ? 'font-bold text-white'
            : 'font-normal text-white/50 hover:text-white/80',
        ].join(' ')}
        aria-label="Switch to English"
      >
        English
      </button>
      <span className="text-white/40 text-sm font-light">|</span>
      <button
        onClick={() => i18n.changeLanguage(LANGUAGES.el)}
        className={[
          'text-sm tracking-widest uppercase transition-all',
          currentLang === LANGUAGES.el
            ? 'font-bold text-white'
            : 'font-normal text-white/50 hover:text-white/80',
        ].join(' ')}
        aria-label="Switch to Greek"
      >
        Greek
      </button>
    </div>
  )
}
