import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import i18n, { LANGUAGES, type Language } from '@/i18n/i18n'

const isSupportedLanguage = (lang: string): lang is Language =>
  (Object.values(LANGUAGES) as string[]).includes(lang)

/**
 * Applies ?lang= from the URL on load/navigation, so an embedding site can
 * control the language by setting the iframe src (e.g. ?lang=el).
 */
export const LanguageSync = () => {
  const [searchParams] = useSearchParams()
  const lang = searchParams.get('lang')

  useEffect(() => {
    if (lang && isSupportedLanguage(lang) && lang !== i18n.language) {
      i18n.changeLanguage(lang)
    }
  }, [lang])

  return null
}
