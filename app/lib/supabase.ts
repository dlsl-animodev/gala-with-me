import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  student_id: string
  name: string
  department: string
  preferred_time: number | null
  created_at: string
}

export interface Match {
  id: number
  user1_id: string
  user2_id: string
  agreed_time: number
  created_at: string
}
