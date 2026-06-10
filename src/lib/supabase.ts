import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isValidUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

let _supabase: SupabaseClient | null = null;
let _serviceClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export function getServiceClient(): SupabaseClient {
  if (_serviceClient) return _serviceClient;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isValidUrl(supabaseUrl) || !serviceKey) {
    throw new Error(
      'Supabase service client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
  }
  _serviceClient = createClient(supabaseUrl, serviceKey);
  return _serviceClient;
}

// Legacy export — lazy proxy so module load doesn't crash
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    return Reflect.get(client, prop);
  },
});
