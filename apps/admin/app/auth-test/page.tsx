'use client'

import { authClient } from '@/auth/auth-client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

export default function AuthTestPage() {
  const { data: session, isPending } = authClient.useSession()
  const [name, setName] = useState('Test Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [log, setLog] = useState('')
  const [loading, setLoading] = useState(false)

  const show = (label: string, value: unknown) =>
    setLog(`// ${label}\n${JSON.stringify(value, null, 2)}`)

  const run = async (fn: () => Promise<void>) => {
    setLoading(true)
    try {
      await fn()
    } finally {
      setLoading(false)
    }
  }

  const role = (session?.user as { role?: string | null } | undefined)?.role

  async function signInWithGoogle() {
    await run(() =>
      authClient.signIn
        .social({ provider: 'google', callbackURL: '/' })
        .then((r) => show('signIn.social (google)', r))
    )
  }

  async function signUp() {
    await run(() =>
      authClient.signUp.email({ name, email, password }).then((r) => show('signUp', r))
    )
  }
  async function signIn() {
    await run(() => authClient.signIn.email({ email, password }).then((r) => show('signIn', r)))
  }
  async function signOut() {
    await run(() => authClient.signOut().then((r) => show('signOut', r)))
  }
  async function rawSessionCheck() {
    await run(async () => {
      try {
        const res = await fetch(`${API}/api/auth/get-session`, {
          credentials: 'include',
        })
        show(`GET /api/auth/get-session → ${res.status}`, await res.json().catch(() => null))
      } catch (e) {
        show('fetch error (CORS or backend not running)', String(e))
      }
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Auth Test</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sandbox for testing Better Auth endpoints
          </p>
        </div>

        {/* Session status */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
              isPending ? 'bg-yellow-400 animate-pulse' : session ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <div className="text-sm">
            {isPending ? (
              <span className="text-gray-400">Checking session…</span>
            ) : session ? (
              <>
                <span className="text-gray-900 dark:text-white font-medium">
                  {session.user.email}
                </span>
                <span className="ml-2 text-gray-400">
                  role: <span className="text-indigo-500 font-medium">{role ?? '—'}</span>
                </span>
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">Not signed in</span>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
          {[
            {
              label: 'Name',
              value: name,
              setter: setName,
              type: 'text',
              placeholder: 'Test Admin',
            },
            {
              label: 'Email',
              value: email,
              setter: setEmail,
              type: 'email',
              placeholder: 'you@example.com',
            },
            {
              label: 'Password',
              value: password,
              setter: setPassword,
              type: 'password',
              placeholder: 'min 8 characters',
            },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {label}
              </label>
              <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => setter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          ))}
        </div>

        {/* Google sign-in */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {/* Google logo */}
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          Continue with Google
        </button>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: 'Sign Up',
              fn: signUp,
              style: 'bg-indigo-600 hover:bg-indigo-700 text-white',
            },
            {
              label: 'Sign In',
              fn: signIn,
              style:
                'bg-gray-900 hover:bg-gray-700 text-white dark:bg-gray-100 dark:hover:bg-gray-300 dark:text-gray-900',
            },
            {
              label: 'Sign Out',
              fn: signOut,
              style:
                'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
            },
            {
              label: 'Raw Session Check',
              fn: rawSessionCheck,
              style:
                'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
            },
          ].map(({ label, fn, style }) => (
            <button
              key={label}
              onClick={fn}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${style}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Log output */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Output
            </span>
            {log && (
              <button
                onClick={() => setLog('')}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                Clear
              </button>
            )}
          </div>
          <pre className="p-4 text-xs text-green-400 bg-gray-950 dark:bg-black min-h-24 overflow-auto whitespace-pre-wrap">
            {log || <span className="text-gray-600">output appears here…</span>}
          </pre>
        </div>
      </div>
    </main>
  )
}
