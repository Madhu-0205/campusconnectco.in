import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the Service Role Key.
 * WARNING: This client bypasses all Row Level Security (RLS) policies.
 * It must ONLY be used on the server, and ONLY after application-level
 * authorization checks have explicitly validated the request.
 * 
 * NEVER expose this to the browser or pass it into client components.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase URL or Service Role Key in environment variables');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
