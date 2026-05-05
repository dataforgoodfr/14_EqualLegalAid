import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { GlobalLayout } from '@/components/Layout/GlobalLayout.tsx'
import { AirtableProvider } from '@/providers'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import { DownloadCaselawProvider } from '@/context/'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CaselawPage, StatisticsPage } from '@/pages'
import './i18n/i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AirtableProvider>
        <DownloadCaselawProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<GlobalLayout />}>
                <Route index element={<CaselawPage />} />
                <Route path="advocacy" element={<StatisticsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DownloadCaselawProvider>
      </AirtableProvider>
    </Provider>
  </StrictMode>,
)
