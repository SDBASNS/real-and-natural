import { createClient } from '@supabase/supabase-js';

/**
 * Checks if active, valid Supabase credentials have been configured in environment variables
 */
export const isSupabaseConfigured = () => {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  return Boolean(
    url &&
    url.startsWith('http') &&
    !url.includes('your-project') &&
    ((serviceKey && !serviceKey.includes('your-service-role')) ||
     (anonKey && !anonKey.includes('your-anon-key')))
  );
};

let _supabase = null;
let _supabaseAdmin = null;

/**
 * Public client for client-side or anonymous requests.
 */
export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) return null;
  if (!_supabase) {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    _supabase = createClient(url, key);
  }
  return _supabase;
};

/**
 * Admin client with Service Role privileges for server-side API routes.
 * Bypasses Row Level Security to allow server endpoints to write & read all orders.
 */
export const getSupabaseAdmin = () => {
  if (!isSupabaseConfigured()) return null;
  if (!_supabaseAdmin) {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
    const key = serviceKey || anonKey;

    _supabaseAdmin = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
};

export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdmin();
