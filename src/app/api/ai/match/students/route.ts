import { NextResponse } from 'next/server';
import { rankStudentsForUser } from '@/lib/ai/rankStudents';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
        
        const ranked = await rankStudentsForUser(userId);
        const results = ranked.map(r => {
            const { vector, ...safeStudent } = r;
            return safeStudent;
        });

        return NextResponse.json({ students: results });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
