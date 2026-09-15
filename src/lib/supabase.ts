import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Keeping this nullable lets the project build before local credentials exist.
export const supabase = url && publishableKey
  ? createClient(url, publishableKey)
  : null
