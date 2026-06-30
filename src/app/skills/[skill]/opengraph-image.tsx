import { ImageResponse } from 'next/og';

import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const alt = 'CampusConnect Skill Page';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function SkillOGImage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = await params;
  const skillName = decodeURIComponent(skill).replace(/-/g, ' ');

  // Fetch live stats for this skill from the DB
  let stats: { gigCount: number; studentCount: number } = { gigCount: 0, studentCount: 0 };
  try {
    const [gigCount, studentCount] = await Promise.all([
      prisma.gig.count({
        where: {
          status: 'OPEN',
          OR: [
            { tags: { contains: skillName, mode: 'insensitive' } },
            { description: { contains: skillName, mode: 'insensitive' } },
          ],
        },
      }),
      prisma.user.count({
        where: {
          role: 'STUDENT',
          skills: { contains: skillName, mode: 'insensitive' },
        },
      }),
    ]);
    stats = { gigCount, studentCount };
  } catch {
    // Fall through to default
  }

  // Canonical display name: title-case
  const displayName = skillName
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // Pick accent color based on first char for variety
  const PALETTES = [
    { bg: 'rgba(99,102,241,0.2)', border: 'rgba(99,102,241,0.4)', text: '#a5b4fc', glow: 'rgba(99,102,241,0.3)' },
    { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', text: '#6ee7b7', glow: 'rgba(16,185,129,0.25)' },
    { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', text: '#fcd34d', glow: 'rgba(245,158,11,0.25)' },
    { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.35)', text: '#f9a8d4', glow: 'rgba(236,72,153,0.25)' },
    { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', text: '#93c5fd', glow: 'rgba(59,130,246,0.25)' },
  ];
  const palette = PALETTES[displayName.charCodeAt(0) % PALETTES.length];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #08080f 0%, #0f0f1f 60%, #080810 100%)',
          padding: '64px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow matching skill color */}
        <div style={{ position: 'absolute', top: '-120px', right: '-60px', width: '500px', height: '500px', borderRadius: '50%', background: `radial-gradient(circle, ${palette.glow} 0%, transparent 65%)` }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', padding: '7px 16px', color: 'white', fontSize: '16px', fontWeight: 800 }}>
            CampusConnect
          </div>
          <div style={{ background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '6px 14px', color: palette.text, fontSize: '14px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Skill Hub
          </div>
        </div>

        {/* Skill name */}
        <div style={{ fontSize: displayName.length > 20 ? '60px' : '80px', fontWeight: 900, color: '#ffffff', lineHeight: 1, letterSpacing: '-2px', marginBottom: '24px' }}>
          {displayName}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '22px', color: '#94a3b8', marginBottom: '48px', fontWeight: 500 }}>
          Find verified student experts · Browse live gigs · Get matched by AI
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '40px', marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '44px', fontWeight: 900, color: palette.text, lineHeight: 1 }}>
              {stats.gigCount > 0 ? stats.gigCount.toLocaleString('en-IN') : '—'}
            </span>
            <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Open Gigs</span>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '44px', fontWeight: 900, color: palette.text, lineHeight: 1 }}>
              {stats.studentCount > 0 ? stats.studentCount.toLocaleString('en-IN') : '—'}
            </span>
            <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Students</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '15px', color: '#475569' }}>campusconnectco.in/skills/{skill}</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
