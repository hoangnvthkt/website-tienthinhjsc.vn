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
    let initialized = false

    const markReady = () => {
      if (mounted && !initialized) {
        initialized = true
        setLoading(false)
      }
    }

    // SAFETY: Always stop loading after 3s max — prevents infinite spinner
    const safetyTimer = setTimeout(markReady, 3000)

    // 1. Set up auth listener FIRST (Supabase recommended pattern)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        if (newSession?.user) {
          setUser(newSession.user)
          setSession(newSession)
          markReady()
          // Fetch profile in background
          const p = await fetchProfile(newSession.user.id)
          if (mounted) setProfile(p)
        } else {
          setUser(null)
          setProfile(null)
          setSession(null)
          markReady()
        }
      }
    )

    // 2. Check existing session (may already resolve via onAuthStateChange)
    const initSession = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession()
        if (!mounted || initialized) return

        if (s?.user) {
          setUser(s.user)
          setSession(s)
          const p = await fetchProfile(s.user.id)
          if (mounted) setProfile(p)
        }
        markReady()
      } catch (err) {
        console.warn('getSession failed:', err)
        markReady()
      }
    }
    initSession()

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    // Clear React state immediately
    setUser(null)
    setProfile(null)
    setSession(null)

    // Clear all Supabase tokens from localStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))

    // Try API signout (don't block on failure)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('Sign out API error:', err)
    }
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
