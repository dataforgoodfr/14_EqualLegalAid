import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { GlobalLayout, StatisticLayoutPage } from '@/components/Layout'
import { LanguageSync } from '@/components/LanguageSync'
import { AirtableProvider } from '@/providers'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import { DownloadCaselawProvider } from '@/context/'
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import {
  CaselawPage,
  AsylumSeekersCampsPage,
  AsylumApplicationsInEuropePage,
  AsylumApplicationsInEuropeanUnion,
  ArrivalsInGreecePage,
  AsylumApplicationsEvolutionInGreecePage,
  ProtectionGrantedVsRejectedPage,
  CourtAsylumProceduresPage,
} from '@/pages'
import './i18n/i18n'

const AdvocacyIndexRedirect = () => {
  const location = useLocation()
  return <Navigate to={{ pathname: 'AsylumApplicationsInEurope', search: location.search }} replace />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <TooltipPrimitive.Provider delayDuration={0}>
      <AirtableProvider>
        <DownloadCaselawProvider>
          <BrowserRouter>
            <LanguageSync />
            <Routes>
              <Route element={<GlobalLayout />}>
                <Route index element={<CaselawPage />} />
              </Route>
              <Route path="advocacy" element={<StatisticLayoutPage />}>
                <Route
                  index
                  element={<AdvocacyIndexRedirect />}
                />
                <Route path="AsylumApplicationsInEurope" element={<AsylumApplicationsInEuropePage />} />
                <Route path="AsylumApplicationsInEuropeanUnion" element={<AsylumApplicationsInEuropeanUnion />} />
                <Route path="ArrivalsInGreece" element={<ArrivalsInGreecePage />} />
                <Route path="AsylumApplicationsEvolutionInGreece" element={<AsylumApplicationsEvolutionInGreecePage />} />
                <Route path="ProtectionGrantedVsRejected" element={<ProtectionGrantedVsRejectedPage />} />
                <Route path="CourtAsylumProcedures" element={<CourtAsylumProceduresPage />} />
                <Route path="AsylumSeekersCamps" element={<AsylumSeekersCampsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DownloadCaselawProvider>
      </AirtableProvider>
      </TooltipPrimitive.Provider>
    </Provider>
  </StrictMode>,
)
