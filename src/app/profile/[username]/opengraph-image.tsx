import { ImageResponse } from 'next/og';

import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const alt = 'CampusConnect Student Profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function ProfileOGImage({
 params,
}: {
 params: Promise<{ username: string }>;
}) {
 const { username } = await params;

 let profile: {
 name: string | null;
 full_name: string | null;
 bio: string | null;
 college: string | null;
 branch: string | null;
 year: string | null;
 isVerified: boolean;
 skills: string | null;
 _count: { gigsPosted: number };
 } | null = null;

 try {
 profile = await prisma.user.findUnique({
 where: { username },
 select: {
 name: true,
 full_name: true,
 bio: true,
 college: true,
 branch: true,
 year: true,
 isVerified: true,
 skills: true,
 _count: { select: { gigsPosted: true } },
 },
 });
 } catch {
 // Fall through to default card
 }

 const displayName = profile?.full_name ?? profile?.name ?? username;
 const bio = profile?.bio?.slice(0, 120) ?? 'Student on CampusConnect';
 const college = profile?.college ?? '';
 const branch = profile?.branch ?? '';
 const year = profile?.year ?? '';
 const verified = profile?.isVerified ?? false;
 const topSkills = profile?.skills
 ? profile.skills.split(',').map(s => s.trim()).slice(0, 5)
 : [];
 const initials = displayName
 .split(' ')
 .map(w => w[0])
 .join('')
 .toUpperCase()
 .slice(0, 2);

 return new ImageResponse(
 (
 <div
 style={{
 width: '100%',
 height: '100%',
 display: 'flex',
 background: 'linear-gradient(135deg, #0d0d1a 0%, #111827 60%, #0a0a18 100%)',
 padding: '60px',
 fontFamily: 'sans-serif',
 position: 'relative',
 }}
 >
 {/* Decorative glows */}
 <div style={{ position: 'absolute', top: '-100px', right: '100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 65%)' }} />
 <div style={{ position: 'absolute', bottom: '-80px', left: '0px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)' }} />

 {/* Left: Avatar + Info */}
 <div style={{ display: 'flex', flexDirection: 'column', flex: 1, zIndex: 1 }}>
 {/* Brand */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
 <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: '10px', padding: '7px 16px', color: 'white', fontSize: '16px', fontWeight: 800 }}>
 CampusConnect
 </div>
 {verified && (
 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', padding: '5px 12px', color: '#34d399', fontSize: '13px', fontWeight: 700 }}>
 ✓ Verified
 </div>
 )}
 </div>

 {/* Avatar + Name */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '28px' }}>
 <div style={{
 width: '100px',
 height: '100px',
 borderRadius: '28px',
 background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 fontSize: '36px',
 fontWeight: 900,
 color: 'white',
 flexShrink: 0,
 }}>
 {initials}
 </div>
 <div style={{ display: 'flex', flexDirection: 'column' }}>
 <div style={{ fontSize: '44px', fontWeight: 900, color: '#ffffff', lineHeight: 1, letterSpacing: '-1px' }}>
 {displayName}
 </div>
 {(college || branch) && (
 <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '8px', fontWeight: 500 }}>
 {[branch, year ? `${year} Year` : '', college].filter(Boolean).join(' · ')}
 </div>
 )}
 </div>
 </div>

 {/* Bio */}
 <div style={{ fontSize: '20px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '32px', maxWidth: '700px' }}>
 {bio}
 </div>

 {/* Skills */}
 {topSkills.length > 0 && (
 <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
 {topSkills.map(skill => (
 <div key={skill} style={{
 background: 'rgba(99,102,241,0.15)',
 border: '1px solid rgba(99,102,241,0.35)',
 borderRadius: '8px',
 padding: '6px 14px',
 color: '#a5b4fc',
 fontSize: '15px',
 fontWeight: 600,
 }}>
 {skill}
 </div>
 ))}
 </div>
 )}

 {/* Bottom */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: 'auto', paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
 <div style={{ fontSize: '15px', color: '#64748b' }}>campusconnectco.in/@{username}</div>
 </div>
 </div>
 </div>
 ),
 { ...size }
 );
}
