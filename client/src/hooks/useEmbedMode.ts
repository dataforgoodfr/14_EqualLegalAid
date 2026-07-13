import { useSearchParams } from 'react-router-dom'

/**
 * When ?embed=1 is present in the URL, the site header (logo, title, nav)
 * is hidden so the app can be embedded in an iframe without duplicate chrome.
 */
export const useEmbedMode = () => {
  const [searchParams] = useSearchParams()
  return searchParams.get('embed') === '1'
}
