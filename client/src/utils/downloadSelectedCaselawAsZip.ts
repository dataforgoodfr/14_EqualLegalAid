import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { SelectedCaselawItem } from '@/types'

function sanitizeFileName(name: string) {
  return name.replace(/[<>:"/\\|?*]+/g, '_')
}

function getFormattedDate() {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

export async function downloadSelectedCaselawAsZip(
  selectedCaselaw: SelectedCaselawItem[],
) {
  if (!selectedCaselaw.length) {
    throw new Error('Aucun fichier sélectionné.')
  }

  const zip = new JSZip()

  await Promise.all(
    selectedCaselaw.map(async(item, index) => {
      const response = await fetch(item.pdf.pdfURL)

      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement du fichier ${item.id}`)
      }

      const blob = await response.blob()

      const originalName = item.pdf.pdfFileName || `document-${index + 1}.pdf`

      // Pour éviter que deux fichiers aient exactement le même nom dans le zip
      const fileName = sanitizeFileName(`${item.id}-${originalName}`)

      zip.file(fileName, blob)
    }),
  )

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const date = getFormattedDate()
  saveAs(zipBlob, `caselaw-documents_${date}.zip`)
}
