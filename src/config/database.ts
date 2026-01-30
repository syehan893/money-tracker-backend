import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import type { Database } from '../types/database.types';

// Supabase client for authenticated user operations (uses anon key with RLS)
let supabaseClient: SupabaseClient<Database> | null = null;

// Supabase admin client for service operations (bypasses RLS)
let supabaseAdmin: SupabaseClient<Database> | null = null;

/**
 * Get the Supabase client for regular operations
 * This client respects Row Level Security policies
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseClient;
}

/**
 * Get the Supabase admin client for service-level operations
 * This client bypasses Row Level Security - use with caution
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseAdmin;
}

/**
 * Create a Supabase client with a specific user's JWT token
 * Used for operations that need to respect RLS for a specific user
 */
export function getSupabaseClientWithAuth(accessToken: string): SupabaseClient<Database> {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = getSupabaseAdmin();
    const { error } = await client.from('profiles').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for connection test
      console.error('Database connection test failed:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
