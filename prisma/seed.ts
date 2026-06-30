import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // Seed Users
  const student1 = await prisma.user.upsert({
    where: { email: 'arjun.student@example.com' },
    update: {},
    create: {
      email: 'arjun.student@example.com',
      name: 'Arjun Sharma',
      username: 'arjun',
      role: 'STUDENT',
      college: 'NIT Trichy',
      branch: 'CSE, 3rd Year',
      skills: 'React, TypeScript, Node.js',
      isVerified: true,
      bio: 'Full stack web developer passionate about React.',
    },
  })
  
  const client1 = await prisma.user.upsert({
    where: { email: 'acme.client@example.com' },
    update: {},
    create: {
      email: 'acme.client@example.com',
      name: 'Acme Corp',
      role: 'CLIENT',
      company_name: 'Acme AI Studio',
      isVerified: true,
    },
  })

  // Seed Gigs
  const gig1 = await prisma.gig.create({
    data: {
      title: 'React Frontend Developer for Dashboard MVP',
      description: 'Looking for a skilled frontend developer to build an MVP for our AI dashboard.',
      required_skills: ["React", "TypeScript", "Tailwind CSS"],
      budget: 2400.00,
      posted_by: client1.id,
      status: 'OPEN'
    },
  })
  
  const gig2 = await prisma.gig.create({
    data: {
      title: 'Python Data Pipeline — Fintech Startup',
      description: 'Data engineer needed to set up pipelines for our fintech product.',
      required_skills: ["Python", "Pandas", "PostgreSQL"],
      budget: 3500.00,
      posted_by: client1.id,
      status: 'OPEN'
    },
  })

  // Seed Internships
  const internship1 = await prisma.internship.create({
    data: {
      title: 'Frontend Engineering Intern',
      company: 'Razorpay',
      description: 'Join our frontend team for a 3-month remote internship.',
      stipend: 8000.00,
      duration: '3 months',
      location: 'Remote',
      skills: 'React, TypeScript, GraphQL',
      status: 'OPEN',
      isFeatured: true
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
