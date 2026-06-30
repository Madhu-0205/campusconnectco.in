import type { Metadata } from "next"
import AboutClient from "./AboutClient"

export const metadata: Metadata = {
  title: "About CampusConnect | Built by Students, For Students — Our Story",
  description:
    "CampusConnect was founded by engineering students who couldn't find real internships. Today we help 10,000+ students across 120 campuses build verified careers before graduation. Meet the team.",
  openGraph: {
    title: "About CampusConnect | Built by Students, For Students",
    description: "From a dorm-room idea to India's largest student opportunity platform. Meet the founders and read our story.",
    images: [{ url: "/og-about.jpg" }],
    type: "website",
  },
  alternates: { canonical: "https://campusconnectco.in/about" },
}

const PERSON_SCHEMA = [
  {
    "@type": "Person",
    "name": "Sathwik",
    "jobTitle": "Founder",
    "worksFor": { "@type": "Organization", "name": "CampusConnect" },
    "url": "https://campusconnectco.in/about",
    "knowsAbout": ["Student Entrepreneurship", "EdTech", "Career Development"],
  },
  {
    "@type": "Person",
    "name": "Suro",
    "jobTitle": "Chief Executive Officer",
    "worksFor": { "@type": "Organization", "name": "CampusConnect" },
    "url": "https://campusconnectco.in/about",
    "knowsAbout": ["Operations", "Platform Scaling", "Student Marketplaces"],
  },
  {
    "@type": "Person",
    "name": "Shanker",
    "jobTitle": "Lead Engineer",
    "worksFor": { "@type": "Organization", "name": "CampusConnect" },
    "url": "https://campusconnectco.in/about",
    "knowsAbout": ["Next.js", "Artificial Intelligence", "Full-Stack Development"],
  },
  {
    "@type": "Person",
    "name": "Akash",
    "jobTitle": "Growth & UI Lead",
    "worksFor": { "@type": "Organization", "name": "CampusConnect" },
    "url": "https://campusconnectco.in/about",
    "knowsAbout": ["Digital Marketing", "UI Design", "Growth Strategy"],
  },
]

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://campusconnectco.in/#organization",
      "name": "CampusConnect",
      "alternateName": "CampusConnect India",
      "url": "https://campusconnectco.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://campusconnectco.in/logo-v2.jpg",
        "width": 512,
        "height": 512,
      },
      "foundingDate": "2024",
      "foundingLocation": {
        "@type": "Place",
        "name": "India",
        "addressCountry": "IN",
      },
      "description":
        "CampusConnect is India's largest verified student opportunity platform connecting 10,000+ students with startups, SMBs and enterprises through AI-matched gigs, internships and campus drives.",
      "sameAs": [
        "https://linkedin.com/company/campusconnectcoin",
        "https://twitter.com/campusconnectin",
        "https://github.com/campusconnectcoin",
        "https://instagram.com/campusconnect.in",
      ],
      "numberOfEmployees": { "@type": "QuantitativeValue", "value": 10 },
      "knowsAbout": [
        "Student Freelancing",
        "Campus Recruitment",
        "AI Career Matching",
        "Micro-Internships",
        "Academic Verification",
        "Milestone Escrow Payments",
      ],
      "founder": PERSON_SCHEMA,
      "member": PERSON_SCHEMA,
    },
    {
      "@type": "AboutPage",
      "url": "https://campusconnectco.in/about",
      "name": "About CampusConnect",
      "description": "The story of CampusConnect — founded by students to solve the experience paradox in India.",
      "publisher": { "@id": "https://campusconnectco.in/#organization" },
    },
  ],
}

import { headers } from "next/headers"

export default async function AboutPage() {
  const nonce = (await headers()).get("x-nonce") || undefined;
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
      />
      <AboutClient />
    </>
  )
}
