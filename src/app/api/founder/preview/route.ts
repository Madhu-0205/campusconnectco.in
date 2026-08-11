import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getUserRoleFromDb } from '@/lib/auth-checks'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
const role = await getUserRoleFromDb(user.id);
const { enable } = await request.json();
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
  } catch (error) {
    console.error("API Error in src/app/api/founder/preview/route.ts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
