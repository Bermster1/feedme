import { supabase } from './supabaseClient'

export const authService = {
  // Send magic link to email
  async signInWithMagicLink(email) {
    try {
      console.log('AuthService: Sending magic link to:', email)
      console.log('AuthService: Redirect URL:', window.location.origin)
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      })
      
      if (error) throw error
      console.log('AuthService: Magic link sent successfully')
      return data
    } catch (error) {
      console.error('AuthService: Error sending magic link:', error)
      throw error
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      console.log('AuthService: Getting current user...')
      const { data: { user } } = await supabase.auth.getUser()
      console.log('AuthService: Current user:', user?.email || 'no user')
      return user
    } catch (error) {
      console.error('AuthService: Error getting current user:', error)
      return null
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Account recovery by baby info
  async recoverAccountByBaby(babyName, birthDate) {
    try {
      // Look up user email by baby name and birth date
      const { data, error } = await supabase
        .from('babies')
        .select(`
          name,
          birth_date,
          families!inner (
            family_members!inner (
              users!inner (email)
            )
          )
        `)
        .eq('name', babyName)
        .eq('birth_date', birthDate)
      
      if (error) throw error
      
      if (data && data.length > 0) {
        // Return the email(s) associated with this baby
        const emails = data.flatMap(baby => 
          baby.families.family_members.map(member => member.users.email)
        )
        return [...new Set(emails)] // Remove duplicates
      }
      
      return []
    } catch (error) {
      console.error('Error recovering account:', error)
      throw error
    }
  }
}