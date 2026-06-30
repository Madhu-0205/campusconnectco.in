import { createBrowserClient } from '@supabase/ssr'

import { fetchWithBackoff } from './fetch'

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
    if (typeof window === 'undefined') {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    fetch: fetchWithBackoff,
                },
            }
        )
    }

    if (client) return client;

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                fetch: fetchWithBackoff,
            },
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
        }
    )

    // Listen to online/offline to pause/resume realtime WebSockets and prevent retry loops
    window.addEventListener('offline', () => {
        if (client) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[Supabase] Offline detected. Disconnecting Realtime WebSocket.');
            }
            client.realtime.disconnect();
        }
    });

    window.addEventListener('online', () => {
        if (client) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[Supabase] Online detected. Reconnecting Realtime WebSocket and triggering token refresh.');
            }
            client.realtime.connect();
            // Instantly try refreshing token when back online
            client.auth.getSession();
        }
    });

    return client;
}
