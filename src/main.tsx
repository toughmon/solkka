import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 안드로이드(Capacitor)에서는 /api 상대경로를 API 서버 절대경로로 변환한다.
const originalFetch = window.fetch;
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '');

window.fetch = async (input, options) => {
    if (typeof input === 'string' && input.startsWith('/api') && API_BASE_URL) {
        input = `${API_BASE_URL}${input}`;
    }
    return originalFetch(input, options);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
