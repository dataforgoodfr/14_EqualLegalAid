import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Colors } from './components/ui/Colors.tsx'
import { AirtableProvider } from '@/providers'

document.documentElement.style.setProperty('--primary', Colors.primary)
document.documentElement.style.setProperty('--secondary', Colors.secondary)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AirtableProvider>
      <App />
    </AirtableProvider>
  </StrictMode>,
)
