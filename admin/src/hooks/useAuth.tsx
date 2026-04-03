import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  authError: string | null
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signOut: () => Promise<void>
  retryAuth: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const TIMEOUT_MS = 12000 // 12s max for any single operation

/**
 * Wrap a promise with a timeout. Rejects if the promise doesn't resolve within `ms`.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label = 'Request'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms / 1000}s`))
    }, ms)

    promise
      .then(val => { clearTimeout(timer); resolve(val) })
      .catch(err => { clearTimeout(timer); reject(err) })
  })
}

function isNetworkError(msg: string): boolean {
  const lc = msg.toLowerCase()
  return (
    lc.includes('failed to fetch') ||
    lc.includes('networkerror') ||
    lc.includes('timed out') ||
    lc.includes('timeout') ||
    lc.includes('load failed') ||
    lc.includes('network request failed') ||
    lc.includes('err_connection') ||
    lc.includes('dns')
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  // ─── Fetch profile (non-blocking, best-effort) ──────────────────────
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      // Execute query then wrap the resulting promise
      const { data, error } = await withTimeout(
        Promise.resolve(supabase.from('profiles').select('*').eq('id', userId).single()),
        8000,
        'Profile fetch'
      )
      if (error) {
        console.warn('[Auth] Profile fetch error:', error.message)
        return null
      }
      return data as Profile | null
    } catch (err) {
      console.warn('[Auth] Profile fetch failed:', err)
      return null
    }
  }, [])

  // ─── Set authenticated state ────────────────────────────────────────
  const setAuthenticated = useCallback(
    (s: Session) => {
      if (!mountedRef.current) return
      setUser(s.user)
      setSession(s)
      setAuthError(null)
      setLoading(false)

      // Fetch profile in background — don't block UI
      fetchProfile(s.user.id).then(p => {
        if (mountedRef.current) setProfile(p)
      })
    },
    [fetchProfile]
  )

  // ─── Clear state (logged out or error) ──────────────────────────────
  const clearState = useCallback(() => {
    if (!mountedRef.current) return
    setUser(null)
    setProfile(null)
    setSession(null)
  }, [])

  // ─── Initialize auth on mount ───────────────────────────────────────
  const initAuth = useCallback(async () => {
    if (!mountedRef.current) return

    setLoading(true)
    setAuthError(null)

    try {
      const { data: { session: existingSession }, error } = await withTimeout(
        supabase.auth.getSession(),
        TIMEOUT_MS,
        'getSession'
      )

      if (!mountedRef.current) return

      if (error) {
        console.warn('[Auth] getSession error:', error.message)
        clearState()
        setAuthError('Lỗi xác thực. Vui lòng đăng nhập lại.')
        setLoading(false)
        return
      }

      if (existingSession?.user) {
        setAuthenticated(existingSession)
      } else {
        clearState()
        setLoading(false)
      }
    } catch (err: unknown) {
      if (!mountedRef.current) return

      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Auth] Init failed:', msg)

      clearState()
      setLoading(false)

      if (isNetworkError(msg)) {
        setAuthError('Không thể kết nối server. Kiểm tra mạng và thử lại.')
      } else {
        setAuthError(msg)
      }
    }
  }, [setAuthenticated, clearState])

  // ─── Manual retry ───────────────────────────────────────────────────
  const retryAuth = useCallback(() => {
    initAuth()
  }, [initAuth])

  // ─── Setup: init + listen for auth changes ─────────────────────────
  useEffect(() => {
    mountedRef.current = true

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mountedRef.current) return

        console.log('[Auth] State change:', event)

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (newSession) {
              setAuthenticated(newSession)
            }
            break

          case 'SIGNED_OUT':
            clearState()
            setLoading(false)
            break
        }
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [initAuth, setAuthenticated, clearState])

  // ─── Sign in ────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null)

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        TIMEOUT_MS,
        'Sign in'
      )

      if (error) {
        return { error: { message: error.message } }
      }

      // Immediately set state from the signIn response
      // Don't wait for onAuthStateChange — it may fire later or not at all
      if (data.session) {
        setAuthenticated(data.session)
      }

      return { error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'

      if (isNetworkError(msg)) {
        return { error: { message: 'Không thể kết nối server. Vui lòng kiểm tra mạng.' } }
      }
      return { error: { message: msg } }
    }
  }, [setAuthenticated])

  // ─── Sign out ───────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    // 1. Clear React state immediately — instant UI feedback
    clearState()

    // 2. Clear all Supabase tokens from localStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))

    // 3. API signout (best-effort, don't block on failure)
    try {
      await withTimeout(supabase.auth.signOut(), 5000, 'Sign out')
    } catch (err) {
      console.warn('[Auth] Sign out API error:', err)
    }
  }, [clearState])

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, authError, signIn, signOut, retryAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
