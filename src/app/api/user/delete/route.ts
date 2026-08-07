import { NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
    const auth = await protectApi(["STUDENT", "FOUNDER", "COLLEGE", "CLIENT", "STARTUP"]);
    if (auth.errorResponse) return auth.errorResponse;

    try {
        const { user } = auth;
        const supabase = await createClient();

        // Validate the request body has confirmation
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        if (body.confirmation !== "DELETE") {
            return NextResponse.json({ error: "Invalid confirmation string" }, { status: 400 });
        }

        // 1. Delete from Prisma (Cascades to related records if configured properly)
        await prisma.user.delete({
            where: { id: user.id }
        });

        // 2. We use the admin SDK to delete the user from Supabase Auth completely, 
        // since supabase.auth.admin requires service role key. We cannot do this client-side.
        // Actually, users can delete their own account using supabase.rpc or edge functions, 
        // but for now we will rely on Prisma deletion. The auth token will still be valid until it expires.
        
        // Wait, best practice is to have the service_role key to delete auth users,
        // but if we don't have it exposed here, the Prisma cascading delete is sufficient 
        // to anonymize the application state. The JWT will just fail subsequent queries.
        
        // Ideally we do: const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
        // If NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY exist in .env:
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (supabaseUrl && supabaseServiceKey) {
            const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
            const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            });
            await supabaseAdmin.auth.admin.deleteUser(user.id);
        }

        return NextResponse.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        console.error("[USER_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}
