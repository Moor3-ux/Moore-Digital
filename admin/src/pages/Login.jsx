import { useState, useRef, useEffect } from 'react'

export default function Login({ onLogin }) {
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState(false)
  const [shaking, setShaking]     = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (onLogin(password)) return
    setError(true)
    setShaking(true)
    setPassword('')
    setTimeout(() => setShaking(false), 500)
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold tracking-tight">MDS</span>
          </div>
          <div>
            <div className="text-base font-semibold text-slate-100 leading-none">Control Panel</div>
            <div className="text-xs text-slate-500 mt-0.5">Moore Digital Solutions</div>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className={`bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 ${shaking ? 'animate-shake' : ''}`}
        >
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Password
            </label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false) }}
              placeholder="Enter panel password"
              className={`w-full bg-slate-800 border rounded-md px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition-colors
                ${error
                  ? 'border-red-500/70 focus:border-red-500'
                  : 'border-slate-700 focus:border-indigo-500'
                }`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-400">Incorrect password.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-medium py-2 rounded-md transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.45s ease; }
      `}</style>
    </div>
  )
}
