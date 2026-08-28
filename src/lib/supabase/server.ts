import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { fetchWithBackoff } from './fetch'

export async function createClient() {
 const cookieStore = await cookies()

 return createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
