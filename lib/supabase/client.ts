import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Esta es la función que todos tus archivos están buscando
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey)
