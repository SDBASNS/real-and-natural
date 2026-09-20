import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Checks if active, valid Supabase credentials have been configured in .env.local
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project') &&
    ((supabaseServiceRoleKey && !supabaseServiceRoleKey.includes('your-service-role')) ||
     (supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key')))
  );
};

/**
 * Public client for client-side or anonymous requests.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey)
  : null;

/**
 * Admin client with Service Role privileges for server-side API routes.
 * Bypasses Row Level Security to allow server endpoints to write & read all orders.
 */
export const supabaseAdmin = (isSupabaseConfigured() && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;
