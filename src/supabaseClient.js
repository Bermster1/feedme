import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY')
  console.error('Current values:', { supabaseUrl, supabaseAnonKey })
}

// Custom storage adapter that handles incognito mode gracefully
const createIncognitoFriendlyStorage = () => {
  let memoryStorage = {}
  
  return {
    async getItem(key) {
      try {
        // Try localStorage first
        if (typeof window !== 'undefined' && window.localStorage) {
          const item = localStorage.getItem(key)
          if (item !== null) return item
        }
      } catch (error) {
        console.warn('localStorage not available, trying sessionStorage')
      }
      
      try {
        // Fall back to sessionStorage
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const item = sessionStorage.getItem(key)
          if (item !== null) return item
        }
      } catch (error) {
        console.warn('sessionStorage not available, using memory storage')
      }
      
      // Final fallback to in-memory storage
      return memoryStorage[key] || null
    },
    
    async setItem(key, value) {
      try {
        // Try localStorage first
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, value)
          return
        }
      } catch (error) {
        console.warn('localStorage not available, trying sessionStorage')
      }
      
      try {
        // Fall back to sessionStorage
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem(key, value)
          return
        }
      } catch (error) {
        console.warn('sessionStorage not available, using memory storage')
      }
      
      // Final fallback to in-memory storage
      memoryStorage[key] = value
    },
    
    async removeItem(key) {
      try {
        // Try localStorage first
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(key)
        }
      } catch (error) {
        console.warn('localStorage not available for removal')
      }
      
      try {
        // Fall back to sessionStorage
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.removeItem(key)
        }
      } catch (error) {
        console.warn('sessionStorage not available for removal')
      }
      
      // Clean up memory storage
      delete memoryStorage[key]
    }
  }
}

export const supabase = createClient(
  supabaseUrl || 'missing-url', 
  supabaseAnonKey || 'missing-key',
  {
    auth: {
      storage: createIncognitoFriendlyStorage(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)