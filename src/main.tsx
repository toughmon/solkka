import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 안드로이드(Capacitor) 또는 모바일 웹 등에서 로컬 API 서버로 직접 연결하기 위한 전역 Patch
const originalFetch = window.fetch;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.206.171:3001';

window.fetch = async (url, options) => {
    if (typeof url === 'string' && url.startsWith('/api')) {
        url = API_BASE_URL + url;
    }
    return originalFetch(url, options);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
