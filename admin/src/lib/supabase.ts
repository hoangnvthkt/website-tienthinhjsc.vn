import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-tienthinh-admin-auth',
    flowType: 'pkce',
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
    // Bypass navigator.locks to prevent stale lock deadlocks
    // when multiple tabs/dev-servers share the same origin
    lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<unknown>) => {
      return await fn()
    },
  },
})
