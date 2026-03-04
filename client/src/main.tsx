import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Colors } from './components/ui/Colors.tsx';

document.documentElement.style.setProperty('--primary', Colors.primary);
document.documentElement.style.setProperty('--secondary', Colors.secondary);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
