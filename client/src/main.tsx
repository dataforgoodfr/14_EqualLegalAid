import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AirtableProvider } from '@/providers'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AirtableProvider>
        <App />
      </AirtableProvider>
    </Provider>
  </StrictMode>,
)
