import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Login   from './pages/Login.jsx'
import { DEMO_MODE } from './lib/api.js'
import { isAuthed, setAuthed, clearAuth, checkPassword } from './lib/auth.js'

export default function App() {
  const [authed, setAuthedState] = useState(isAuthed)

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
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {DEMO_MODE && <DemoBanner />}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function DemoBanner() {
  return (
    <div className="flex items-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-6 py-2">
      <span className="text-amber-400 text-xs font-medium">DEMO MODE</span>
      <span className="text-amber-400/60 text-xs">
        No AWS connection — displaying mock data. Set <code className="font-mono bg-amber-500/10 px-1 rounded">VITE_MDS_API_URL</code> to connect.
      </span>
    </div>
  )
}
