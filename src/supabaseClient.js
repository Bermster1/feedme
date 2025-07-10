import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY')
  console.error('Current values:', { supabaseUrl, supabaseAnonKey })
}

export const supabase = createClient(supabaseUrl || 'missing-url', supabaseAnonKey || 'missing-key')