/**
 * Seed script: inserts 15 realistic student gigs into the DB.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json prisma/seed-gigs.ts
 *
 * Requires at least ONE user to exist in the User table.
 * The gigs will be assigned to the first user found (or an env-specified one).
 * Safe to re-run — skips gigs whose titles already exist.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SEED_GIGS = [
  {
    title: 'Design poster for college tech fest',
    description:
      "Need an A3 poster for our annual tech fest 'Ignite 2025'. Should include event name, date, venue, and sponsor logos. Vibrant, modern design preferred.",
    budget: 350,
    work_mode: 'remote',
    tags: 'Poster,Graphic Design,Canva,Illustrator',
    required_skills: ['Graphic Design', 'Canva'],
  },
  {
    title: 'Debug Python DBMS mini project',
    description:
      'My college DBMS project has errors in the SQL queries and Flask backend. Need someone to debug and explain the fixes so I understand it.',
    budget: 220,
    work_mode: 'remote',
    tags: 'Python,SQL,Flask,DBMS',
    required_skills: ['Python', 'SQL'],
  },
  {
    title: 'Handwritten DBMS Unit 3 notes',
    description:
      'Need clean, clear handwritten notes for DBMS Unit 3 (ER diagrams, normalization, SQL). Should be scan-ready. About 15–20 pages.',
    budget: 100,
    work_mode: 'in-person',
    tags: 'DBMS,Notes,Handwritten',
    required_skills: ['DBMS'],
  },
  {
    title: 'Photographer for cultural night event',
    description:
      'Need a photographer for our department cultural night. 3 hours coverage, 100+ edited photos delivered within 2 days. Must have DSLR or Sony mirrorless.',
    budget: 750,
    work_mode: 'in-person',
    tags: 'Photography,DSLR,Events,Editing',
    required_skills: ['Photography', 'Photo Editing'],
  },
  {
    title: 'Build a React portfolio website',
    description:
      'Need a clean, responsive portfolio website built in React. Should include: About, Projects, Skills, Contact sections. Dark theme preferred. Deploy on Vercel.',
    budget: 1400,
    work_mode: 'remote',
    tags: 'React,TailwindCSS,Vercel,Frontend',
    required_skills: ['React', 'TailwindCSS', 'Git'],
  },
  {
    title: 'Write department newsletter (Feb edition)',
    description:
      '500-word newsletter for our CSE department. Topics: fest recap, placement news, upcoming events. Needs to be engaging and professional.',
    budget: 175,
    work_mode: 'remote',
    tags: 'Writing,Newsletter,English',
    required_skills: ['Content Writing', 'English'],
  },
  {
    title: '10-slide PowerPoint for project presentation',
    description:
      'Final year project presentation — 10 slides. Topic: Smart Attendance System using Face Recognition. Professional theme, icons, charts needed.',
    budget: 275,
    work_mode: 'remote',
    tags: 'PowerPoint,Presentation,Design',
    required_skills: ['PowerPoint', 'Design'],
  },
  {
    title: 'Explain DSA concepts (1-hour session)',
    description:
      'Need a peer tutor to explain Trees, Graphs, and Dynamic Programming. Online session on Google Meet. Must be able to solve LeetCode mediums.',
    budget: 300,
    work_mode: 'remote',
    tags: 'DSA,LeetCode,C++,Tutoring',
    required_skills: ['DSA', 'C++', 'Problem Solving'],
  },
  {
    title: 'Create Instagram reels for college fest',
    description:
      '3 short reels (30–45s each) promoting our college annual fest. Need someone with CapCut/Premiere skills. Trendy edits with music sync.',
    budget: 500,
    work_mode: 'remote',
    tags: 'Video Editing,Instagram,CapCut,Reels',
    required_skills: ['Video Editing', 'CapCut'],
  },
  {
    title: 'UI/UX design for college app (Figma)',
    description:
      'Design 8–10 screens for a college timetable app in Figma. Clean, minimal, student-friendly UI. Include: login, timetable, notifications, profile screens.',
    budget: 1050,
    work_mode: 'remote',
    tags: 'Figma,UI/UX,Mobile Design,Prototype',
    required_skills: ['Figma', 'UI Design', 'Prototyping'],
  },
  {
    title: 'Translate 5 pages English to Telugu',
    description:
      'Need accurate translation of 5 pages of academic content from English to Telugu. Must be a native Telugu speaker. Not Google Translate.',
    budget: 150,
    work_mode: 'remote',
    tags: 'Telugu,Translation,Academic',
    required_skills: ['Telugu', 'Translation'],
  },
  {
    title: 'Set up GitHub Actions CI/CD pipeline',
    description:
      'Set up a basic CI/CD pipeline using GitHub Actions for a Node.js app. Should auto-deploy to Vercel on push to main. Document the setup.',
    budget: 600,
    work_mode: 'remote',
    tags: 'GitHub Actions,CI/CD,DevOps,Node.js',
    required_skills: ['GitHub Actions', 'Node.js', 'Vercel'],
  },
  {
    title: 'Create logo for student startup',
    description:
      "Need a modern logo for a student-run food delivery startup called 'QuickBite'. Minimalist, memorable, works on dark and light backgrounds. Deliver in SVG + PNG.",
    budget: 550,
    work_mode: 'remote',
    tags: 'Logo Design,Branding,Illustrator,SVG',
    required_skills: ['Logo Design', 'Adobe Illustrator'],
  },
  {
    title: 'Record voice-over for explainer video (Hindi)',
    description:
      '3-minute voice-over in clear Hindi for a product explainer video. Script provided. Need a confident, friendly voice. Home recording is fine if quality is good.',
    budget: 225,
    work_mode: 'remote',
    tags: 'Voice Over,Hindi,Audio,Recording',
    required_skills: ['Voice Over', 'Hindi'],
  },
  {
    title: 'Data entry and Excel dashboard',
    description:
      'Enter 200 rows of sales data into Excel and create a clean dashboard with charts (bar, pie, line). Should auto-update when data changes. Send as .xlsx',
    budget: 350,
    work_mode: 'remote',
    tags: 'Excel,Data Entry,Dashboard,Charts',
    required_skills: ['Excel', 'Data Analysis'],
  },
]

async function main() {
  console.log('\n🌱 Starting gig seed…\n')

  // Find a user to assign gigs to (prefer the first FOUNDER/CLIENT, fallback to any user)
  const poster = await prisma.user.findFirst({
    where: { role: { in: ['FOUNDER', 'CLIENT', 'STARTUP'] } },
    orderBy: { createdAt: 'asc' },
  }) ?? await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } })

  if (!poster) {
    console.error('❌ No users found in database. Create at least one user account first, then re-run this script.')
    process.exit(1)
  }

  console.log(`👤 Assigning gigs to user: ${poster.email} (${poster.role})\n`)

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

  let created = 0
  let skipped = 0

  for (const gig of SEED_GIGS) {
    // Skip if a gig with this exact title already exists (idempotent)
    const existing = await prisma.gig.findFirst({ where: { title: gig.title } })
    if (existing) {
      console.log(`  ⏭️  Skipped (exists): ${gig.title}`)
      skipped++
      continue
    }

    await prisma.gig.create({
      data: {
        title: gig.title,
        description: gig.description,
        budget: gig.budget,
        work_mode: gig.work_mode,
        tags: gig.tags,
        required_skills: gig.required_skills,
        status: 'active',
        expires_at: expiresAt,
        posted_by: poster.id,
      },
    })

    console.log(`  ✅ Created: ${gig.title} (₹${gig.budget})`)
    created++
  }

  console.log(`\n📊 Done. ${created} created, ${skipped} skipped.\n`)
}

main()
  .catch(err => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
