import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { signIn, authError, retryAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const displayError = error || authError || ''

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    if (loading) return // Prevent double-submit

    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'Email hoặc mật khẩu không đúng'
            : signInError.message
        )
        setLoading(false)
      }
      // If no error → user state is already set by signIn
      // Loading will be cleared when AuthGuard re-renders with user
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError('')
    retryAuth()
  }

  const isNetworkErr =
    displayError.includes('kết nối') ||
    displayError.includes('fetch') ||
    displayError.includes('timeout') ||
    displayError.includes('server') ||
    displayError.includes('NetworkError') ||
    displayError.includes('timed out')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20M5 20V10l7-6 7 6v10M9 20v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Tiến Thịnh JSC</h1>
          <p className="text-gray-400 mt-1">Đăng nhập Admin Panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          {displayError && (
            <div
              className={`px-4 py-3 rounded-lg text-sm ${
                isNetworkErr
                  ? 'bg-amber-50 border border-amber-200 text-amber-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">
                  {isNetworkErr ? '🌐' : '⚠️'}
                </span>
                <div className="flex-1">
                  <p>{displayError}</p>
                  {isNetworkErr && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-md transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114.9-4M20 15a8 8 0 01-14.9 4" />
                      </svg>
                      Thử lại
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tienthinhjsc.vn"
              required
              disabled={loading}
              autoComplete="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors disabled:bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors disabled:bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          © 2024 Tiến Thịnh JSC. Admin Panel v1.0
        </p>
      </div>
    </div>
  )
}
