import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  user_id: string
  full_name?: string
  username?: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  github_url?: string
  linkedin_url?: string
  twitter_url?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description?: string
  content?: string
  demo_url?: string
  github_url?: string
  image_url?: string
  technologies?: string[]
  category?: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  user_id: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content?: string
  featured_image?: string
  status: 'draft' | 'published'
  tags?: string[]
  reading_time?: number
  created_at: string
  updated_at: string
  user_id: string
}

export interface StatusCheck {
  id: string
  client_name: string
  timestamp: string
  user_id?: string
}