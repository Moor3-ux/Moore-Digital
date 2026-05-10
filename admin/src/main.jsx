import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import { installGlobalHandlers, diagEnvironment } from './mds-diag.js'
import { runHealthCheck } from './admin-healthcheck.js'
import App          from './App.jsx'
import Overview     from './pages/Overview.jsx'
import Clients      from './pages/Clients.jsx'
import Leads        from './pages/Leads.jsx'
import Deployments  from './pages/Deployments.jsx'
import Diagnostics  from './pages/Diagnostics.jsx'
import Settings     from './pages/Settings.jsx'

// ── Build identification ───────────────────────────────────────────────────────
window.__MDS_BUILD__ = __MDS_BUILD__

// ── Diagnostics — install before React renders ────────────────────────────────
installGlobalHandlers()
diagEnvironment(import.meta.env.VITE_MDS_API_URL)

// ── Router ────────────────────────────────────────────────────────────────────
// basename: '/admin' tells React Router that all routes live under /admin.
// NavLinks still use paths like '/' and '/clients' — React Router prepends
// the basename automatically. Hard refreshes and direct URL entry work because
// Amplify's rewrite rule serves /admin/index.html for /admin/<*>.
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true,              element: <Overview />    },
        { path: 'clients',          element: <Clients />     },
        { path: 'leads',            element: <Leads />       },
        { path: 'deployments',      element: <Deployments /> },
        { path: 'diagnostics',      element: <Diagnostics /> },
        { path: 'settings',         element: <Settings />    },
      ],
    },
  ],
  { basename: '/admin' }
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)

// ── Post-mount health check ───────────────────────────────────────────────────
// Runs after React mounts so it never blocks the initial render.
runHealthCheck(import.meta.env.VITE_MDS_API_URL)
