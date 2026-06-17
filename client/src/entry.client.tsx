// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import { GlobalLayout, StatisticLayoutPage } from '@/components/Layout'
// import { AirtableProvider } from '@/providers'
// import { store } from './redux/store.ts'
// import { Provider } from 'react-redux'
// import { DownloadCaselawProvider } from '@/context/'
// import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
// import {
//   CaselawPage,
//   AsylumApplicationsInEuropePage,
//   AsylumApplicationsInEuropeanUnion,
//   ArrivalsInGreecePage,
//   AsylumApplicationsEvolutionInGreecePage,
//   ProtectionGrantedVsRejectedPage,
// } from '@/pages'
// import './i18n/i18n'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <Provider store={store}>
//       <AirtableProvider>
//         <DownloadCaselawProvider>
//           <BrowserRouter>
//             <Routes>
//               <Route element={<GlobalLayout />}>
//                 <Route index element={<CaselawPage />} />
//               </Route>
//               <Route path="advocacy" element={<StatisticLayoutPage />}>
//                 <Route
//                   index
//                   element={<Navigate to="AsylumApplicationsInEurope" replace />}
//                 />
//                 <Route path="AsylumApplicationsInEurope" element={<AsylumApplicationsInEuropePage />} />
//                 <Route path="AsylumApplicationsInEuropeanUnion" element={<AsylumApplicationsInEuropeanUnion />} />
//                 <Route path="ArrivalsInGreece" element={<ArrivalsInGreecePage />} />
//                 <Route path="AsylumApplicationsEvolutionInGreece" element={<AsylumApplicationsEvolutionInGreecePage />} />
//                 <Route path="ProtectionGrantedVsRejected" element={<ProtectionGrantedVsRejectedPage />} />
//               </Route>
//             </Routes>
//           </BrowserRouter>
//         </DownloadCaselawProvider>
//       </AirtableProvider>
//     </Provider>
//   </StrictMode>,
// )


import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import "./index.css";

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>,
);