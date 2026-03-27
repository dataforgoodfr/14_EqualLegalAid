/**
 * Handles downloading a PDF file
 * @param url - The URL of the PDF
 * @param filename - Optional custom filename (default: 'document.pdf')
 */
export const downloadPdf = (url: string, filename: string = 'document.pdf'): void => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  // link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
