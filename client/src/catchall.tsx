import { AirtableProvider } from '@/providers'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import { DownloadCaselawProvider } from '@/context/'
import{CaselawPage} from '@/pages'
import { HeaderComponent } from '@/components/Header'


export default function Component() {
  return (
    <Provider store={store}>
        <AirtableProvider>
            <div className="app mx-auto my-0 w-full xl:max-w-315">
                <HeaderComponent />
                <main className="main-content px-4 xl:px-0">
                    <DownloadCaselawProvider>
                        <CaselawPage/>
                    </DownloadCaselawProvider>
                </main>
            </div>
        </AirtableProvider>
    </Provider>
  )
}