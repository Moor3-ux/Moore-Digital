import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Login   from './pages/Login.jsx'
import { DEMO_MODE } from './lib/api.js'
import { isAuthed, setAuthed, clearAuth, checkPassword } from './lib/auth.js'

export default function App() {
  const [authed, setAuthedState]        = useState(isAuthed)
  const [mobileMenuOpen, setMobileMenu] = useState(false)

  function handleLogin(password) {
    if (!checkPassword(password)) return false
    setAuthed()
    setAuthedState(true)
    return true
  }

  function handleLogout() {
    clearAuth()
    setAuthedState(false)
  }

  if (!authed) return <Login onLogin={handleLogin} />

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar
        onLogout={handleLogout}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenu(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 md:hidden flex-shrink-0">
          <button
            onClick={() => setMobileMenu(true)}
            className="text-slate-400 hover:text-slate-200 p-1 -ml-1"
            aria-label="Open navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">MDS</span>
            </div>
            <span className="text-sm font-semibold text-slate-100">Control Panel</span>
          </div>
        </div>

        {DEMO_MODE && <DemoBanner />}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function DemoBanner() {
  return (
    <div className="flex items-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
      <span className="text-amber-400 text-xs font-medium shrink-0">DEMO MODE</span>
      <span className="text-amber-400/60 text-xs truncate">
        No AWS connection — set <code className="font-mono bg-amber-500/10 px-1 rounded">VITE_MDS_API_URL</code> to connect.
      </span>
    </div>
  )
}
