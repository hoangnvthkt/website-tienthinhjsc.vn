import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import LoginPage from '@/features/auth/LoginPage'

interface AuthGuardProps {
  children: React.ReactNode
}

const MAX_LOADING_MS = 15000 // Show error after 15s of loading

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, authError, retryAuth } = useAuth()
  const [loadingTooLong, setLoadingTooLong] = useState(false)

  // Safety net: if loading is stuck for too long, show fallback
  useEffect(() => {
    if (!loading) {
      setLoadingTooLong(false)
      return
    }

    const timer = setTimeout(() => {
      setLoadingTooLong(true)
    }, MAX_LOADING_MS)

    return () => clearTimeout(timer)
  }, [loading])

  // Loading stuck too long — offer escape
  if (loading && loadingTooLong) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
              <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Tải quá lâu</h2>
            <p className="text-sm text-gray-500 mb-5">
              Kết nối đến server đang chậm. Vui lòng thử lại.
            </p>
            <button
              onClick={() => {
                setLoadingTooLong(false)
                retryAuth()
              }}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114.9-4M20 15a8 8 0 01-14.9 4" />
              </svg>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Normal loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      </div>
    )
  }

  // Connection error screen (no user, has error)
  if (authError && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
              <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Không thể kết nối</h2>
            <p className="text-sm text-gray-500 mb-5">
              {authError}
            </p>
            <button
              onClick={retryAuth}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114.9-4M20 15a8 8 0 01-14.9 4" />
              </svg>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated → show login
  if (!user) return <LoginPage />

  // Authenticated → render children
  return <>{children}</>
}
