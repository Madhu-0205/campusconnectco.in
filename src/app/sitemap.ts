import type { MetadataRoute } from 'next';

import prisma from '@/lib/prisma';
import { SKILLS_DATASET } from '@/lib/skills-dataset';

const COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT BHU", "IIT Patna",
  "NIT Trichy", "NIT Warangal", "NIT Surathkal", "NIT Calicut", "NIT Rourkela",
  "BITS Pilani", "BITS Goa", "BITS Hyderabad", "BITS Pilani (Pilani Campus)",
  "IIIT Hyderabad", "IIIT Bangalore", "IIIT Allahabad",
  "VIT Vellore", "VIT Chennai", "VIT Bhopal", "VIT-AP",
  "SRM Institute of Science and Technology", "Manipal Institute of Technology",
  "PSG College of Technology", "Amrita School of Engineering",
  "Jadavpur University", "Anna University", "Osmania University",
  "Delhi Technological University", "NSUT Delhi", "IGDTUW",
  "PES University", "RV College of Engineering", "BMS College of Engineering",
  "SASTRA University", "Vellore Institute of Technology", "Sri Sivasubramaniya Nadar College",
  "Karpagam Academy of Higher Education", "Kumaraguru College of Technology",
  "Thiagarajar College of Engineering", "Coimbatore Institute of Technology",
  "Birla Institute of Technology Mesra", "Thapar Institute of Engineering",
  "Chandigarh University", "LPU (Lovely Professional University)",
  "KIIT University", "Kalinga Institute of Industrial Technology"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in';

  // 1. Static Pages (priority tiered by E-E-A-T importance)
  const staticRoutes: Array<{ route: string; priority: number; changeFreq: MetadataRoute.Sitemap[0]['changeFrequency'] }> = [
    // Core — highest priority
    { route: '',                     priority: 1.0, changeFreq: 'daily' },
    { route: '/about',               priority: 0.95, changeFreq: 'weekly' },
    { route: '/success-stories',     priority: 0.95, changeFreq: 'weekly' },
    { route: '/trust',               priority: 0.9,  changeFreq: 'monthly' },
    { route: '/editorial',           priority: 0.85, changeFreq: 'monthly' },
    // Gamification / Community
    { route: '/leaderboard',          priority: 0.9,  changeFreq: 'daily' },
    // Product
    { route: '/marketplace',         priority: 0.9,  changeFreq: 'daily' },
    { route: '/pricing',             priority: 0.85, changeFreq: 'weekly' },
    { route: '/manifesto',           priority: 0.8,  changeFreq: 'monthly' },
    // Employer B2B
    { route: '/employer/talent-search', priority: 0.8, changeFreq: 'weekly' },
    { route: '/employer/drives',        priority: 0.8, changeFreq: 'weekly' },
    { route: '/employer/upgrade',       priority: 0.85, changeFreq: 'weekly' },
    // Legal & Trust
    { route: '/terms-and-conditions', priority: 0.5, changeFreq: 'yearly' },
    { route: '/privacy-policy',       priority: 0.5, changeFreq: 'yearly' },
    { route: '/refund-policy',        priority: 0.5, changeFreq: 'yearly' },
    { route: '/contact-us',           priority: 0.6, changeFreq: 'monthly' },
    // Growth Engine
    { route: '/ambassador',           priority: 0.9, changeFreq: 'weekly' },
    { route: '/join',                 priority: 0.85, changeFreq: 'daily' },
    { route: '/refer',                priority: 0.8, changeFreq: 'monthly' },
  ];

  const staticUrls = staticRoutes.map(({ route, priority, changeFreq }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority,
  }));

  // 2. Fetch Open Gigs dynamically
  let gigUrls: MetadataRoute.Sitemap = [];
  try {
    const openGigs = await prisma.gig.findMany({
      where: { status: 'OPEN' },
      select: { id: true, updatedAt: true },
      take: 200, // safety cap to prevent sitemap overload
    });

    gigUrls = openGigs.map((gig: any) => ({
      url: `${baseUrl}/gigs/${gig.id}`,
      lastModified: gig.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to query gigs for sitemap:', error);
  }

  // 3. Programmatic Skills Pages
  const skillUrls = SKILLS_DATASET.map(s => ({
    url: `${baseUrl}/skills/${s.name.replace(/\s+/g, '-').toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 4. Programmatic Colleges Pages
  const collegeUrls = COLLEGES.map(c => ({
    url: `${baseUrl}/colleges/${c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 5. Programmatic Cities Gigs Pages
  const TOP_CITIES = ["bangalore", "pune", "mumbai", "delhi", "hyderabad", "chennai", "kolkata"];
  const cityGigUrls = TOP_CITIES.map(city => ({
    url: `${baseUrl}/gigs/city/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // 6. Programmatic Cities Internships Pages
  const cityInternshipUrls = TOP_CITIES.map(city => ({
    url: `${baseUrl}/internships/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // 7. Public Student Profile Pages (verified students with a username)
  let profileUrls: MetadataRoute.Sitemap = [];
  try {
    const profiles = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        isVerified: true,
        username: { not: null },
      },
      select: { username: true, updatedAt: true },
      take: 500, // cap to keep sitemap under 50k URLs
      orderBy: { updatedAt: 'desc' },
    });
    const typedProfiles: Array<{ username: string | null; updatedAt: Date }> = profiles;
    profileUrls = typedProfiles
      .filter((p): p is { username: string; updatedAt: Date } => Boolean(p.username))
      .map(p => ({
        url: `${baseUrl}/profile/${p.username}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.error('Failed to query profiles for sitemap:', error);
  }

  return [...staticUrls, ...gigUrls, ...profileUrls, ...skillUrls, ...collegeUrls, ...cityGigUrls, ...cityInternshipUrls];
}
