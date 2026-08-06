import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PlatformApp from './platform/PlatformApp.jsx'
import LegalPage from './legal/LegalPage.jsx'
import { TenantProvider } from './tenant/TenantProvider.jsx'

// TenantProvider en modo legacy (por defecto) provee branding Johel y NO hace
// gating: la app se comporta igual que hoy. Con VITE_MULTITENANT=on resuelve el
// tenant por hostname/slug. BrowserRouter habilita rutas SPA (ver vercel.json).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <Routes>
          {/* Panel de Plataforma: ruta global separada del tenant. El acceso real
              se valida contra platform_admins dentro de PlatformApp. */}
          <Route path="/platform/*" element={<PlatformApp />} />
          {/* Páginas legales públicas (no dependen de tenant ni sesión). */}
          <Route path="/terminos" element={<LegalPage doc="terms" />} />
          <Route path="/privacidad" element={<LegalPage doc="privacy" />} />
          <Route path="*" element={<App />} />
        </Routes>
      </TenantProvider>
    </BrowserRouter>
  </StrictMode>,
)
