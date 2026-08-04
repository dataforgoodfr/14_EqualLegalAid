import { useEffect } from 'react'

const MESSAGE_SOURCE = 'equal-legal-aid'
const MESSAGE_TYPE = 'ela:resize'

/**
 * When embedded in an iframe, reports the document's content height to the
 * parent window on every change (postMessage), so the host page can resize
 * the iframe itself instead of scrolling inside it (double scrollbar issue).
 * No-op outside of an iframe.
 */
export const IframeResizeSync = () => {
  useEffect(() => {
    if (window.parent === window) return

    const postHeight = () => {
      const height = document.documentElement.scrollHeight
      window.parent.postMessage({ source: MESSAGE_SOURCE, type: MESSAGE_TYPE, height }, '*')
    }

    postHeight()

    const observer = new ResizeObserver(postHeight)
    observer.observe(document.documentElement)

    return () => observer.disconnect()
  }, [])

  return null
}
