import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from './authService'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...')
        const currentUser = await authService.getCurrentUser()
        console.log('AuthContext: Initial user:', currentUser)
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial session:', error)
        // In incognito mode, initial session may fail but auth state change will work
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, session?.user?.email || 'no user')
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signInWithMagicLink = async (email, inviteToken = null) => {
    try {
      // Don't set global loading for magic link - let LoginScreen handle its own state
      return await authService.signInWithMagicLink(email, inviteToken)
    } catch (error) {
      console.error('Error signing in with magic link:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await authService.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const recoverAccount = async (babyName, birthDate) => {
    try {
      return await authService.recoverAccountByBaby(babyName, birthDate)
    } catch (error) {
      console.error('Error recovering account:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithMagicLink,
    signOut,
    recoverAccount,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}