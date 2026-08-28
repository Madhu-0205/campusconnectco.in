import { NextResponse } from 'next/server';

import { generateCoverLetter, improveCoverLetter } from '@/lib/ai/coverLetter';
import prisma from '@/lib/prisma';
import { aiLimiter } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';


export async function POST(req: Request) {
 try {
 const ip = req.headers.get('x-forwarded-for') || 'unknown';
 if (!(await aiLimiter.check(ip))) {
 return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
 }

 const supabase = await createClient();

 const { data: { user }, error: authError } = await supabase.auth.getUser();
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const body = await req.json();
 const { gigId, tone, action, originalLetter, feedback } = body;

 // Handle improve action
 if (action === 'improve' && originalLetter && feedback) {
 const improved = await improveCoverLetter(originalLetter, feedback);
 return NextResponse.json({ coverLetter: improved });
 }

 if (!gigId) {
 return NextResponse.json({ error: 'gigId required' }, { status: 400 });
 }

 // Fetch gig + student profile in parallel
 const [gig, profile] = await Promise.all([
 prisma.gig.findUnique({
 where: { id: gigId },
 include: { gigSkills: { include: { skill: true } } }
 }),
 prisma.user.findUnique({
 where: { id: user.id },
 include: { projects: true }
 })
 ]);

 if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
 if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

 const gigSkills = gig.gigSkills.map((gs: any) => gs.skill.name).join(', ');

 const coverLetter = await generateCoverLetter({
 gigTitle: gig.title,
 gigDescription: gig.description,
 gigBudget: gig.budget,
 gigSkills: gigSkills || (gig.tags ?? undefined),
 studentName: profile.full_name || profile.name || 'Student',
 studentSkills: profile.skills ?? '',
 studentBio: profile.bio ?? undefined,
 studentCollege: profile.college ?? undefined,
 studentBranch: profile.branch ?? undefined,
 studentYear: profile.year ?? undefined,
 studentProjects: profile.projects,
 tone: tone || 'professional',
 });

 return NextResponse.json({ coverLetter });
 } catch (e: any) {
 console.error('[cover-letter]', e);
 return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
 }
}
