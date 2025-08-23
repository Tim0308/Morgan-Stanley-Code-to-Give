import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual Supabase credentials
const supabaseUrl = 'https://wvkiqhspazqflewgnohr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2a2lxaHNwYXpxZmxld2dub2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4Nzc5NzEsImV4cCI6MjA3MTQ1Mzk3MX0.urNZeoVPUYkqy8jWpPPBd2vvBrN4gUo4FDsx-DJzgr0'

// For testing, you can temporarily use these values:
// const supabaseUrl = 'https://your-actual-project-id.supabase.co'
// const supabaseAnonKey = 'your-actual-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined, // Use default AsyncStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Database types (based on your schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          role: 'parent' | 'teacher' | 'admin'
          full_name: string | null
          locale: string
          school: string | null
          grade: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          role?: 'parent' | 'teacher' | 'admin'
          full_name?: string | null
          locale?: string
          school?: string | null
          grade?: string | null
        }
        Update: {
          full_name?: string | null
          locale?: string
          school?: string | null
          grade?: string | null
        }
      }
      children: {
        Row: {
          id: string
          parent_user_id: string
          nickname: string | null
          age_band: string | null
          created_at: string
        }
        Insert: {
          parent_user_id: string
          nickname?: string | null
          age_band?: string | null
        }
        Update: {
          nickname?: string | null
          age_band?: string | null
        }
      }
    }
  }
} 