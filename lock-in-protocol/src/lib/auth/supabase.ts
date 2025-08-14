import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/ssr'

// For client-side auth
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// For client components
export const createSupabaseClient = () => {
  return createClientComponentClient()
}

// Simple auth functions for single-user setup
export const authService = {
  // Check if user is authenticated
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Sign in with email/password (for single user)
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}