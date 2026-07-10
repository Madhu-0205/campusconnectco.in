import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { fetchWithBackoff } from './fetch'

export async function createClient() {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            global: {
                fetch: fetchWithBackoff,
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },

                setAll(
                    cookiesToSet: {
                        name: string
                        value: string
                        options?: CookieOptions
                    }[]
                ) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch (error) {
                        // Called from Server Component — safe to ignore
                        if (process.env.NODE_ENV === 'development') {
                            console.warn('Cookie set error:', error)
                        }
                    }
                },
            },
        }
    )
}
