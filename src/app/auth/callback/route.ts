import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            return NextResponse.redirect(`${origin}/auth/signin?error=${error.message}`)
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${origin}/dashboard`)
}
