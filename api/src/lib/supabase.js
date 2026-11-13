import { createClient } from '@supabase/supabase-js';

let client;

// Server-side only: the service-role key bypasses RLS and must never reach the browser.
export function getSupabase(config) {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  client ??= createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
