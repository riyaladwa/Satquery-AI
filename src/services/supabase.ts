import { createClient } from '@supabase/supabase-js';

// Active Supabase Project Credentials (with fallback to ensure zero runtime disconnection)
export const DEFAULT_SUPABASE_URL = 'https://yyzqpdgkqzjyhvgfjaqn.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_BufmU3CqqmJoFcg702gu4Q_Q_MV3DdD';

export const supabaseUrl: string =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || DEFAULT_SUPABASE_URL;

export const supabaseAnonKey: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || DEFAULT_SUPABASE_ANON_KEY;

// Export active Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
};

// Ping Supabase to verify live connection
export const checkSupabaseHealth = async (): Promise<{ connected: boolean; latencyMs?: number; error?: string }> => {
  const start = performance.now();
  try {
    const { error } = await supabase.auth.getSession();
    const latencyMs = Math.round(performance.now() - start);
    if (error) {
      return { connected: false, latencyMs, error: error.message };
    }
    return { connected: true, latencyMs };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Connection timeout' };
  }
};

