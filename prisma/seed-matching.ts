import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding mock data for AI and Radius Matching...')

    // Upsert a test user if not exists
    const user = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: {
            skills: 'React, TypeScript, Node.js',
            latitude: 12.9716, // Bangalore Center
            longitude: 77.5946
        },
        create: {
            email: 'student@example.com',
            name: 'Test Student',
            role: 'STUDENT',
            skills: 'React, TypeScript, Node.js',
            latitude: 12.9716,
            longitude: 77.5946
        }
    })

    // Create Gigs with varying distances and tags
    const gigs = [
        {
            title: 'Senior React Developer',
            description: 'Looking for a React expert near Bangalore.',
            budget: 15000,
            tags: 'React, Next.js, TypeScript',
            latitude: 12.9720, // ~100m away
            longitude: 77.5950,
            posterId: user.id
        },
        {
            title: 'Node.js Backend Dev',
            description: 'Need help with an express server.',
            budget: 8000,
            tags: 'Node.js, Postgres',
            latitude: 12.9800, // ~1km away
            longitude: 77.6000,
            posterId: user.id
        },
        {
            title: 'Python Data Scientist',
            description: 'Remote project for ML.',
            budget: 20000,
            tags: 'Python, ML',
            latitude: 13.0827, // Chennai (~300km away)
            longitude: 80.2707,
            posterId: user.id
        }
    ]

    for (const gig of gigs) {
        await prisma.gig.create({
            data: gig
        })
    }

    console.log('Seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
