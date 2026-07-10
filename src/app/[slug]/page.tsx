import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"

import { FAQSchema, BreadcrumbSchema, WebsiteSchema } from "@/components/seo/JsonLd"
import { SEO_LANDING_PAGES, SEO_LANDING_PAGE_SLUGS } from "@/lib/seoLandingPages"

export const dynamic = "force-static"

export async function generateStaticParams() {
  return SEO_LANDING_PAGE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = SEO_LANDING_PAGES[params.slug]
  if (!page) return { title: "Page not found | CampusConnect" }

  const canonical = `https://www.campusconnectco.in/${params.slug}`

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical,
      languages: { "en-IN": canonical },
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      type: "website",
      images: [{ url: "/logo-v2.jpg", width: 1200, height: 630, alt: page.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/logo-v2.jpg"],
      site: "@campusconnectin",
    },
    robots: { index: true, follow: true },
  }
}

export default async function SEOLandingPage({ params }: { params: { slug: string } }) {
  const page = SEO_LANDING_PAGES[params.slug]
  if (!page) notFound()

  const nonce = (await headers()).get("x-nonce") || undefined

  return (
    <>
      <WebsiteSchema nonce={nonce} />
      <FAQSchema faqs={page.faqs} nonce={nonce} />
      <BreadcrumbSchema
        nonce={nonce}
        items={[
          { name: "Home", url: "https://www.campusconnectco.in" },
          { name: page.title, url: `https://www.campusconnectco.in/${params.slug}` },
        ]}
      />

      <main className="max-w-7xl mx-auto px-6 py-14 lg:px-8">
        <section className="space-y-6 text-slate-950">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">CampusConnect SEO Landing</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{page.heroTitle}</h1>
            <p className="mt-6 text-lg leading-8 text-slate-700">{page.heroSubtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={page.primaryCta.href} className="inline-flex items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700">
                {page.primaryCta.label}
              </Link>
              {page.secondaryCta && (
                <Link href={page.secondaryCta.href} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  {page.secondaryCta.label}
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Verified student talent</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Connect with verified students and campus creators who deliver measurable results.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">AI-powered matching</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Match talent to opportunities with relevance signals, college fit, and skills alignment.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Secure hiring workflows</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Use escrow-backed milestones and verified employer workflows to reduce hiring risk.</p>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Benefits</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Why students and employers choose CampusConnect</h2>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            {page.benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-950">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Featured listings</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Opportunities worth exploring</h2>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            {page.featuredCards.map((card) => (
              <article key={card.title} className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-violet-500/30 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.subtitle}</p>
                <Link href={card.url} className="mt-6 inline-flex text-sm font-semibold text-violet-600 transition group-hover:text-violet-800">
                  Explore <span aria-hidden>→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <header className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Related content</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Explore more student growth pathways</h2>
          </header>

          <ul className="grid gap-3 sm:grid-cols-2">
            {page.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-950 transition hover:border-violet-500/30 hover:bg-violet-50">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">FAQs</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Common questions from students and employers</h2>
          </header>
          <div className="space-y-6">
            {page.faqs.map((faq) => (
              <article key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-violet-200 bg-violet-600 p-10 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight">Ready to move forward?</h2>
            <p className="mt-4 text-base leading-7 text-violet-100">Start with the right student opportunity, build credibility, and hire or apply with confidence.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={page.primaryCta.href} className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg shadow-black/10 transition hover:bg-slate-100">
                {page.primaryCta.label}
              </Link>
              {page.secondaryCta && (
                <Link href={page.secondaryCta.href} className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                  {page.secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
