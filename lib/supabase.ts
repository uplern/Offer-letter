import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
  },
})

// Database types
export interface Admin {
  id: string
  name: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  code: string
  description?: string
  created_at: string
}

export interface Tenure {
  id: string
  label: string
  months: number
  created_at: string
}

export interface Template {
  id: string
  title: string
  filename: string
  type: string
  created_by_admin_id?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Candidate {
  id: string
  first_name: string
  last_name: string
  father_name?: string
  college_name?: string
  address?: string
  email: string
  phone?: string
  role_id?: string
  tenure_id?: string
  status: string
  // File upload fields
  aadhar_front_url?: string
  aadhar_back_url?: string
  photo_url?: string
  college_id_url?: string
  marksheet_12th_url?: string
  created_at: string
  updated_at: string
  // Relations
  role?: Role
  tenure?: Tenure
}

export interface OfferLetter {
  id: string
  user_id: string
  template_id?: string
  filename: string
  generated_by_admin_id?: string
  created_at: string
  // Relations
  user?: Candidate
  template?: Template
}
