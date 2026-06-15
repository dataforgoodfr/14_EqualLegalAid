import { DownloadCaselawProvider } from '@/context/'
import{CaselawPage} from '@/pages'

export default function Component() {
  return (
    <DownloadCaselawProvider>
        <CaselawPage/>
    </DownloadCaselawProvider>    
  )
}