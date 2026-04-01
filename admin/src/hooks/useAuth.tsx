import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return data
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Initial session check with timeout
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 4000))

    Promise.race([sessionPromise, timeoutPromise]).then(async (result) => {
      if (!mounted) return

      if (result && 'data' in result && result.data.session?.user) {
        const s = result.data.session
        const p = await fetchProfile(s.user.id)
        if (mounted) {
          setUser(s.user)
          setSession(s)
          setProfile(p)
        }
      }
      if (mounted) setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return
        if (newSession?.user) {
          setUser(newSession.user)
          setSession(newSession)
          setLoading(false)
          // Fetch profile in background (don't block UI)
          const p = await fetchProfile(newSession.user.id)
          if (mounted) setProfile(p)
        } else {
          setUser(null)
          setProfile(null)
          setSession(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
