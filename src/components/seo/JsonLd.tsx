import React from 'react'

const WIKIDATA_MAP: Record<string, string> = {
  // Cities
  "bangalore": "https://www.wikidata.org/wiki/Q1355",
  "pune": "https://www.wikidata.org/wiki/Q1515",
  "mumbai": "https://www.wikidata.org/wiki/Q1156",
  "delhi": "https://www.wikidata.org/wiki/Q1353",
  "hyderabad": "https://www.wikidata.org/wiki/Q1361",
  "chennai": "https://www.wikidata.org/wiki/Q1354",
  "kolkata": "https://www.wikidata.org/wiki/Q1348",

  // Colleges
  "iit bombay": "https://www.wikidata.org/wiki/Q1358999",
  "iit delhi": "https://www.wikidata.org/wiki/Q839180",
  "iit madras": "https://www.wikidata.org/wiki/Q1576402",
  "iit kanpur": "https://www.wikidata.org/wiki/Q565985",
  "iit kharagpur": "https://www.wikidata.org/wiki/Q1576208",
  "iit roorkee": "https://www.wikidata.org/wiki/Q2007802",
  "iit guwahati": "https://www.wikidata.org/wiki/Q1567950",
  "iit hyderabad": "https://www.wikidata.org/wiki/Q5971167",
  "iit bhu": "https://www.wikidata.org/wiki/Q4836486",
  "nit trichy": "https://www.wikidata.org/wiki/Q3521257",
  "bits pilani": "https://www.wikidata.org/wiki/Q863753",
  "iiit hyderabad": "https://www.wikidata.org/wiki/Q3524672",
  "dtu": "https://www.wikidata.org/wiki/Q1257912",
  "delhi technological university": "https://www.wikidata.org/wiki/Q1257912",
  "nsut delhi": "https://www.wikidata.org/wiki/Q7053531",

  // Skills
  "color contrast": "https://www.wikidata.org/wiki/Q11222",
  "focus states": "https://www.wikidata.org/wiki/Q1134262",
  "alt text": "https://www.wikidata.org/wiki/Q11222",
  "aria labels": "https://www.wikidata.org/wiki/Q11222",
  "keyboard navigation": "https://www.wikidata.org/wiki/Q1134262",
  "image optimization": "https://www.wikidata.org/wiki/Q2718871",
  "content layout shift": "https://www.wikidata.org/wiki/Q105658117",
  "next.js app router": "https://www.wikidata.org/wiki/Q115682855",
  "nextjs": "https://www.wikidata.org/wiki/Q115682855",
  "tailwind css": "https://www.wikidata.org/wiki/Q85805166",
  "figma prototyping": "https://www.wikidata.org/wiki/Q28456106",
  "react component architecture": "https://www.wikidata.org/wiki/Q18915033",
  "react": "https://www.wikidata.org/wiki/Q18915033",
  "user research & heuristics": "https://www.wikidata.org/wiki/Q245228",
}

export function getWikidataURI(name: string): string | undefined {
  if (!name) return undefined;
  const key = name.trim().toLowerCase();
  return WIKIDATA_MAP[key] || undefined;
}

export function OrganizationSchema({ nonce }: { nonce?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CampusConnect",
    "url": "https://campusconnectco.in",
    "logo": "https://campusconnectco.in/logo-v2.jpg",
    "sameAs": [
      "https://linkedin.com/company/campusconnectcoin",
      "https://github.com/campusconnectcoin"
    ],
    "knowsAbout": [
      "Student Freelancing",
      "Software Development Internships",
      "Micro-Internships",
      "Academic Verification",
      "Milestone Escrow Payments",
      "Technical Skill Matching"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Student Opportunity Catalog",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Milestone Escrow Payment Protection"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI-Powered SmartMatch Recruiting"
          }
        }
      ]
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-0000000000",
      "contactType": "customer service",
      "email": "support@campusconnectco.in"
    }
  }

  return (
    <script nonce={nonce} suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function JobPostingSchema({
  title,
  description,
  datePosted,
  validThrough,
  budget,
  companyName,
  locationName,
  skills,
  nonce
}: {
  title: string
  description: string
  datePosted: string
  validThrough?: string
  budget: number
  companyName: string
  locationName?: string
  skills?: string[]
  nonce?: string
}) {
  const sameAsLinks: string[] = []
  if (locationName) {
    const cityURI = getWikidataURI(locationName)
    if (cityURI) sameAsLinks.push(cityURI)
  }
  if (skills) {
    skills.forEach(s => {
      const skillURI = getWikidataURI(s)
      if (skillURI) sameAsLinks.push(skillURI)
    })
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": title,
    "description": description,
    "datePosted": datePosted,
    ...(validThrough && { "validThrough": validThrough }),
    "employmentType": "CONTRACTOR",
    "hiringOrganization": {
      "@type": "Organization",
      "name": companyName,
      "sameAs": "https://campusconnectco.in"
    },
    "jobLocationType": "TELECOMMUTE",
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": {
        "@type": "QuantitativeValue",
        "value": budget,
        "unitText": "PROJECT"
      }
    },
    ...(sameAsLinks.length > 0 && {
      "sameAs": sameAsLinks
    })
  }

  return (
    <script nonce={nonce} suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebsiteSchema({ nonce }: { nonce?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CampusConnect",
    "url": "https://campusconnectco.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://campusconnectco.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script nonce={nonce} suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface StudentPersonData {
  name: string
  jobTitle?: string
  alumniOf?: string
  sameAs?: string[]
}

export function StudentPersonSchema({ data, nonce }: { data: StudentPersonData; nonce?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": data.name,
    "jobTitle": data.jobTitle || "Student Developer",
    ...(data.alumniOf && {
      "alumniOf": {
        "@type": "EducationalOrganization",
        "name": data.alumniOf
      }
    }),
    ...(data.sameAs && data.sameAs.length > 0 && {
      "sameAs": data.sameAs.filter(Boolean)
    })
  }

  return (
    <script nonce={nonce} suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface FAQItem {
  question: string
  answer: string
}

export function FAQSchema({ faqs, nonce }: { faqs: FAQItem[]; nonce?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <script nonce={nonce} suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbSchema({ items, nonce }: { items: BreadcrumbItem[]; nonce?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <script nonce={nonce} suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ── WebSite with SearchAction (enables Sitelinks Searchbox) ─────────────────
export function WebSiteSchema({ nonce }: { nonce?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CampusConnect",
    "alternateName": "CampusConnect India",
    "url": "https://campusconnectco.in",
    "description": "India's largest verified student opportunity platform",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://campusconnectco.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://campusconnectco.in/#organization",
      "name": "CampusConnect"
    }
  }
  return (
    <script nonce={nonce} suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ── AggregateRating — shows stars in search results ──────────────────────────
export function AggregateRatingSchema({
  ratingValue = "4.9",
  reviewCount = "10000",
  nonce
}: {
  ratingValue?: string
  reviewCount?: string
  nonce?: string
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CampusConnect",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://campusconnectco.in",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "reviewCount": reviewCount,
      "bestRating": "5",
      "worstRating": "1",
    },
  }
  return (
    <script nonce={nonce} suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

