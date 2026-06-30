import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getUserRoleFromDb } from '@/lib/auth-checks'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    // Security check: Only allow if authenticated as FOUNDER or SUPER_ADMIN in session
    // Because this endpoint sets the cookie that bypasses middleware check.
    // However, middleware *also* checks for 'FOUNDER' role *before* checking the cookie for student access.
    // So if a student calls this, the cookie is set, but middleware won't care because role is STUDENT.
    // If a Founder calls this, middleware sees Founder + Cookie -> Allows student access.
    // So safe to just set cookie?
    // Better to verify session just in case.

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = await getUserRoleFromDb(user.id);
    const { enable } = await request.json();

    // If attempting to enter preview mode, verify they are a Founder
    if (enable && role !== 'FOUNDER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const cookieStore = await cookies();

    if (enable) {
        cookieStore.set('admin_preview_mode', 'true', { path: '/' });
    } else {
        cookieStore.delete('admin_preview_mode');
    }

    return NextResponse.json({ success: true });
}
