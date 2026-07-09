export interface SEOLandingPageData {
  title: string
  description: string
  keywords: string[]
  heroTitle: string
  heroSubtitle: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  benefits: Array<{ title: string; description: string }>
  faqs: Array<{ question: string; answer: string }>
  relatedLinks: Array<{ label: string; href: string }>
  featuredCards: Array<{ title: string; subtitle: string; url: string }>
}

const commonRelatedLinks = [
  { label: "Internships", href: "/internships" },
  { label: "Freelance Jobs", href: "/freelance-jobs" },
  { label: "AI Career Roadmap", href: "/ai-career-roadmap" },
  { label: "Hire Student Talent", href: "/hire-student-talent" },
]

export const SEO_LANDING_PAGES: Record<string, SEOLandingPageData> = {
  internships: {
    title: "Student Internships in India | CampusConnect",
    description:
      "Discover verified student internships, college jobs, and remote roles across India with AI matching, secure escrow, and startup hiring confidence.",
    keywords: [
      "student internships",
      "college internships",
      "campus jobs",
      "AI internship matching",
      "paid internships",
      "startup internships",
    ],
    heroTitle: "Find internships that build real experience",
    heroSubtitle:
      "CampusConnect connects students to high-growth internships, startup roles, and campus gigs with AI matching and secure payments.",
    primaryCta: { label: "Browse Internships", href: "/internships" },
    secondaryCta: { label: "Hire Interns", href: "/hire-student-talent" },
    benefits: [
      { title: "Verified student opportunities", description: "Every internship is reviewed for legitimacy, learning value, and employer trust." },
      { title: "AI-powered matching", description: "Get matched to roles that fit your skills, college, and career goals in real-time." },
      { title: "Secure milestone payments", description: "Escrow protects students and employers until work is approved and delivered." },
    ],
    faqs: [
      { question: "Can I apply to internships without a resume?", answer: "Yes. CampusConnect lets students apply using profiles, skills, and milestone-based portfolios for faster hiring." },
      { question: "Are internships on CampusConnect paid?", answer: "Most internships are paid, with transparent stipends and secure payment terms before work begins." },
      { question: "Can I find internships near my college?", answer: "Yes. Filter internships by city, college, remote availability, and startup stage for local and hybrid roles." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Remote Product Intern", subtitle: "Build product features for early-stage startups.", url: "/gigs/find?q=product+intern" },
      { title: "Data Science Internship", subtitle: "Work on real analytics projects with AI-ready teams.", url: "/data-science-internships" },
      { title: "Engineering Internship", subtitle: "Ship full-stack features for growth startups.", url: "/engineering-internships" },
    ],
  },
  "campus-gigs": {
    title: "Campus Gigs for Students | CampusConnect",
    description:
      "Earn on campus with verified campus gigs, event support roles, and micro-projects designed for students who want flexible income and skill experience.",
    keywords: ["campus gigs", "student gigs", "college side projects", "event support jobs", "campus hiring"],
    heroTitle: "Campus gigs that pay and grow your profile",
    heroSubtitle:
      "Discover short-term campus roles, event support gigs, and freelance micro-projects that fit your college schedule.",
    primaryCta: { label: "Explore Campus Gigs", href: "/campus-gigs" },
    secondaryCta: { label: "Hire Student Talent", href: "/hire-student-talent" },
    benefits: [
      { title: "Flexible project work", description: "Pick gigs that fit your class timetable, campus activities, and learning priorities." },
      { title: "Trusted student employers", description: "Work with verified companies, event organizers, and campus teams." },
      { title: "Fast payout options", description: "Receive payments quickly through secure milestone tracking and verification." },
    ],
    faqs: [
      { question: "How are campus gigs different from internships?", answer: "Campus gigs are short-term, skill-based tasks and event roles that offer flexible hours and faster payouts compared to internships." },
      { question: "Can I take multiple campus gigs at once?", answer: "Yes, as long as the schedules do not overlap. You can manage multiple gigs based on your availability." },
      { question: "Do employers verify student credentials?", answer: "CampusConnect supports student verification to help employers trust your profile and hire you confidently." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Campus Brand Ambassador", subtitle: "Promote brands, events, and products on your campus.", url: "/campus-gigs" },
      { title: "Event Marketing Gig", subtitle: "Support student events, workshops, and hackathons.", url: "/campus-gigs" },
      { title: "Social Media Content Gig", subtitle: "Create college-focused social content for startups.", url: "/marketing-internships" },
    ],
  },
  "freelance-jobs": {
    title: "Freelance Jobs for Students | CampusConnect",
    description:
      "Build a freelance portfolio with design, development, writing, and marketing projects that pay students fairly and connect them with verified clients.",
    keywords: ["freelance jobs", "student freelancing", "freelance marketplace", "remote freelance India", "startup gigs"],
    heroTitle: "Freelance jobs built for college students",
    heroSubtitle:
      "Find short-term freelance projects from startups and brands that value student talent, mentorship, and fast delivery.",
    primaryCta: { label: "Browse Freelance Jobs", href: "/freelance-jobs" },
    secondaryCta: { label: "Build Your Profile", href: "/join" },
    benefits: [
      { title: "Project-based income", description: "Earn on milestones, deliver client work, and grow a real freelance portfolio." },
      { title: "Verified clients", description: "Work with vetted startups, educators, and campus brands that trust student creators." },
      { title: "Skill-based matching", description: "Land gigs that match your technical, creative, and leadership strengths." },
    ],
    faqs: [
      { question: "Can I freelance without prior experience?", answer: "Yes. CampusConnect helps students find entry-level freelance jobs and build their first professional project portfolio." },
      { question: "How are freelance payments protected?", answer: "Payments are secured with escrow so funds are available before work starts and released after project acceptance." },
      { question: "Can I work with clients outside my college?", answer: "Yes. Students can take remote freelance jobs from startups and brands across India." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "UI/UX Freelance Job", subtitle: "Design interfaces for product teams and campus founders.", url: "/ui-ux-internships" },
      { title: "Product Marketing Project", subtitle: "Create launch assets for startup campaigns.", url: "/marketing-internships" },
      { title: "Junior Developer Gig", subtitle: "Build features for early-stage SaaS companies.", url: "/software-internships" },
    ],
  },
  "remote-internships": {
    title: "Remote Internships for Students | CampusConnect",
    description:
      "Access remote internships with Indian startups and global teams. Learn from mentors, build remote collaboration skills, and earn from anywhere.",
    keywords: ["remote internships", "work from home internship", "remote student jobs", "virtual internships", "online internships"],
    heroTitle: "Remote internships that fit college life",
    heroSubtitle:
      "Work remotely on real projects for startups, marketing teams, and engineering groups while staying connected with mentors.",
    primaryCta: { label: "Find Remote Internships", href: "/remote-internships" },
    secondaryCta: { label: "Apply with One Click", href: "/join" },
    benefits: [
      { title: "Work from anywhere", description: "Take flexible remote internships that adapt to your schedule and college commitments." },
      { title: "Global portfolio building", description: "Gain remote experience with startups and distributed teams across India and beyond." },
      { title: "Communication coaching", description: "Get guidance on remote collaboration, client updates, and productivity." },
    ],
    faqs: [
      { question: "Are remote internships paid?", answer: "Yes. Many remote internships on CampusConnect offer paid stipends and milestone-based payments." },
      { question: "How do remote payments work?", answer: "Payments are secured using escrow so you can focus on work while funds are safely held until completion." },
      { question: "Will remote internships count on my resume?", answer: "Absolutely. Remote internships are recognized as professional experience, especially when completed with verified startups." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Remote Marketing Internship", subtitle: "Launch digital campaigns for fast-growing brands.", url: "/marketing-internships" },
      { title: "Remote Data Internship", subtitle: "Analyze datasets and build dashboards remotely.", url: "/data-science-internships" },
      { title: "Remote Engineering Internship", subtitle: "Work on product features from anywhere.", url: "/engineering-internships" },
    ],
  },
  "software-internships": {
    title: "Software Internships for Students | CampusConnect",
    description:
      "Launch your software career with internships in frontend, backend, mobile, and full-stack development from verified student-friendly employers.",
    keywords: ["software internships", "developer internships", "coding internships", "tech internships", "student developer jobs"],
    heroTitle: "Software internships that sharpen your development skills",
    heroSubtitle:
      "Find engineering internships where students build real products, ship code, and learn with mentor-led technical guidance.",
    primaryCta: { label: "Explore Software Internships", href: "/software-internships" },
    secondaryCta: { label: "Build Your Developer Profile", href: "/join" },
    benefits: [
      { title: "Build production code", description: "Gain experience with modern stacks, version control, and agile workflows." },
      { title: "Engineer with mentorship", description: "Work with engineering leads who provide feedback and learning checkpoints." },
      { title: "Career-ready deliverables", description: "Ship projects that become portfolio examples for future job interviews." },
    ],
    faqs: [
      { question: "Which software internship roles are available?", answer: "CampusConnect lists front-end, back-end, mobile, full-stack, and product engineering internships for students." },
      { question: "Can I apply as a first-year student?", answer: "Yes. Many internships are open to first-year and second-year students who demonstrate enthusiasm and foundational skills." },
      { question: "How do mentors support interns?", answer: "Mentors provide code reviews, technical roadmaps, and feedback to help you grow through the internship." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Full-Stack Software Internship", subtitle: "Build end-to-end features for growth-stage startups.", url: "/software-internships" },
      { title: "AI Product Internship", subtitle: "Work on AI-enabled products and student tools.", url: "/ai-career-roadmap" },
      { title: "Internship Skill Booster", subtitle: "Learn modern engineering skills with startup mentorship.", url: "/skills" },
    ],
  },
  "data-science-internships": {
    title: "Data Science Internships for Students | CampusConnect",
    description:
      "Work on analytics, ML, and data projects with startups that value data-driven student talent and deliver measurable impact.",
    keywords: ["data science internships", "analytics internships", "machine learning internships", "student data roles"],
    heroTitle: "Data science internships for future analysts",
    heroSubtitle:
      "Apply to internships that let students explore real datasets, build dashboards, and support decision-making with insights.",
    primaryCta: { label: "Find Data Science Internships", href: "/data-science-internships" },
    secondaryCta: { label: "See AI Roadmaps", href: "/ai-career-roadmap" },
    benefits: [
      { title: "Hands-on data projects", description: "Analyze real metrics, build models, and deliver insights for startup growth." },
      { title: "Learn ML fundamentals", description: "Gain experience with Python, SQL, visualization, and machine learning workflows." },
      { title: "Showcase measurable work", description: "Add data-backed internship projects to your resume and portfolio." },
    ],
    faqs: [
      { question: "Do I need advanced statistics skills?", answer: "No. Many internships welcome students with basic analytics skills and a willingness to learn." },
      { question: "Are data internships remote?", answer: "Yes. CampusConnect offers both remote and hybrid data science internships for students." },
      { question: "How can I prepare for data internship interviews?", answer: "Review case studies, SQL queries, and problem-solving examples related to data analysis." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "ML Research Internship", subtitle: "Contribute to data modeling and AI research projects.", url: "/ai-career-roadmap" },
      { title: "Analytics Internship", subtitle: "Build dashboards for student-led startups.", url: "/data-science-internships" },
      { title: "Internship Prep Guide", subtitle: "Read student interview tips and portfolio best practices.", url: "/editorial" },
    ],
  },
  "marketing-internships": {
    title: "Marketing Internships for Students | CampusConnect",
    description:
      "Join marketing internships that help students grow brand strategy, digital campaigns, content, and launch plans for startups and campus brands.",
    keywords: ["marketing internships", "digital marketing internships", "student marketing jobs", "growth internships"],
    heroTitle: "Marketing internships for ambitious students",
    heroSubtitle:
      "Work on campaigns, content, and growth strategies that help startups and campus initiatives scale while you learn market skills.",
    primaryCta: { label: "Browse Marketing Internships", href: "/marketing-internships" },
    secondaryCta: { label: "Join CampusConnect", href: "/join" },
    benefits: [
      { title: "Campaign experience", description: "Run social, email, and brand campaigns for startups and student communities." },
      { title: "Creative portfolio", description: "Build work examples that prove your growth marketing and content skills." },
      { title: "Mentorship from marketers", description: "Learn from founders and growth professionals who hire student talent." },
    ],
    faqs: [
      { question: "Do marketing internships require design skills?", answer: "Not always. Many roles focus on strategy, content, community, and campaign execution." },
      { question: "Can I apply part-time while studying?", answer: "Yes. Marketing internships can be flexible and tailored around your class schedule." },
      { question: "Will I get measurable results?", answer: "Yes. Students are assigned real campaign goals, performance metrics, and reporting expectations." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Campus Growth Internship", subtitle: "Support student acquisition and campus outreach campaigns.", url: "/campus-gigs" },
      { title: "Content Marketing Internship", subtitle: "Create content for early-stage products.", url: "/marketing-internships" },
      { title: "Brand Strategy Project", subtitle: "Help startups define launch messaging.", url: "/internships" },
    ],
  },
  "ui-ux-internships": {
    title: "UI/UX Internships for Students | CampusConnect",
    description:
      "Design interfaces, product experiences, and prototypes with internships that help students become user-focused designers and product thinkers.",
    keywords: ["ui/ux internships", "design internships", "student design roles", "product design internship"],
    heroTitle: "UI/UX internships that teach design thinking",
    heroSubtitle:
      "Work on real product interfaces, prototypes, and research tasks for teams that value student creativity and usability skills.",
    primaryCta: { label: "Discover UI/UX Internships", href: "/ui-ux-internships" },
    secondaryCta: { label: "See Student Portfolios", href: "/student-network" },
    benefits: [
      { title: "Design real products", description: "Create interfaces, user flows, and prototypes for digital startups." },
      { title: "User research practice", description: "Learn to gather feedback, iterate designs, and test usability." },
      { title: "Portfolio-ready work", description: "Collect design deliverables and case studies to share with future employers." },
    ],
    faqs: [
      { question: "Do I need advanced tools for UI/UX internships?", answer: "No. A strong portfolio, user-centered thinking, and basic design tools are usually enough." },
      { question: "Can I do research-focused internships?", answer: "Yes. Many roles include UX research, user interviews, and usability testing tasks." },
      { question: "How do I display my work?", answer: "Use case studies, prototypes, and visual summaries to showcase your UI/UX process." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Product Design Internship", subtitle: "Design features for student-facing apps.", url: "/ui-ux-internships" },
      { title: "UX Research Project", subtitle: "Help teams discover what users need.", url: "/student-network" },
      { title: "Design Career Roadmap", subtitle: "Plan your next steps in product design.", url: "/ai-career-roadmap" },
    ],
  },
  "startup-internships": {
    title: "Startup Internships for Students | CampusConnect",
    description:
      "Join startup internships that let students build fast, learn from founders, and take ownership of meaningful product work.",
    keywords: ["startup internships", "student startup jobs", "early-stage internships", "founder internships"],
    heroTitle: "Startup internships for students who want impact",
    heroSubtitle:
      "Work directly with startup founders on growth, product, engineering, and marketing while gaining real ownership and speed.",
    primaryCta: { label: "Explore Startup Internships", href: "/startup-internships" },
    secondaryCta: { label: "Hire Student Talent", href: "/hire-student-talent" },
    benefits: [
      { title: "Founder-led learning", description: "Work with early-stage teams and get direct mentorship from founders." },
      { title: "Cross-functional exposure", description: "Contribute across product, engineering, marketing, and operations." },
      { title: "High-growth resume experience", description: "Build startup achievements that stand out to future employers." },
    ],
    faqs: [
      { question: "What kinds of startup internships are listed?", answer: "CampusConnect lists product, engineering, design, marketing, and operations internships at high-growth startups." },
      { question: "How do startups verify students?", answer: "Verified student profiles and academic credentials make hiring faster and safer for startups." },
      { question: "Can I work with remote founders?", answer: "Yes. Startup internships include remote and hybrid opportunities that suit student schedules." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Growth Startup Internship", subtitle: "Help early-stage teams launch products and acquire users.", url: "/startup-internships" },
      { title: "Campus Ambassador Program", subtitle: "Represent startups on your campus.", url: "/campus-gigs" },
      { title: "Career Roadmap for Founders", subtitle: "Plan a startup career path with AI guidance.", url: "/ai-career-roadmap" },
    ],
  },
  "business-development-internships": {
    title: "Business Development Internships | CampusConnect",
    description:
      "Land business development internships that help students learn sales, partnerships, market research, and growth execution for startups.",
    keywords: ["business development internships", "biz dev internships", "sales internships", "startup business roles"],
    heroTitle: "Business development internships for student growth",
    heroSubtitle:
      "Build sales, partnerships, and market intelligence skills while working with startups that need student-driven growth support.",
    primaryCta: { label: "Find Business Development Roles", href: "/business-development-internships" },
    secondaryCta: { label: "Hire Student Talent", href: "/hire-student-talent" },
    benefits: [
      { title: "Real sales experience", description: "Work on outreach, partnerships, and client conversations with mentorship." },
      { title: "Market research exposure", description: "Learn how startups validate demand and position products in competitive markets." },
      { title: "Growth-focused outcomes", description: "Deliver measurable results that support customer acquisition and revenue." },
    ],
    faqs: [
      { question: "Do business development internships need prior sales experience?", answer: "No. Many roles prioritize communication, persistence, and growth mindset over prior experience." },
      { question: "Will I get training?", answer: "Yes. Employers often provide onboarding, lead lists, and mentoring for student business development interns." },
      { question: "Can I work with startups or established companies?", answer: "CampusConnect lists both startup and SME opportunities for business development interns." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Growth Strategy Internship", subtitle: "Support startups with customer development and partnerships.", url: "/business-development-internships" },
      { title: "Student Networking Page", subtitle: "Connect with employers and mentors.", url: "/student-network" },
      { title: "Employer Hiring Guide", subtitle: "Learn how to hire student talent effectively.", url: "/hire-student-talent" },
    ],
  },
  "engineering-internships": {
    title: "Engineering Internships for Students | CampusConnect",
    description:
      "Find engineering internships in software, hardware, product, and research that help students launch technical careers with real project ownership.",
    keywords: ["engineering internships", "technical internships", "student engineering jobs", "software internships"],
    heroTitle: "Engineering internships that launch careers",
    heroSubtitle:
      "Work with seasoned engineers on product features, technical systems, and real deliverables that build your engineering resume.",
    primaryCta: { label: "Explore Engineering Internships", href: "/engineering-internships" },
    secondaryCta: { label: "View Talent Profiles", href: "/student-network" },
    benefits: [
      { title: "Real engineering work", description: "Contribute to product architecture, feature delivery, and technical documentation." },
      { title: "Mentored learning", description: "Receive guidance from engineering leads and technical founders." },
      { title: "Portfolio-ready outcomes", description: "Ship projects that demonstrate your engineering skills and problem-solving." },
    ],
    faqs: [
      { question: "Is prior code experience required?", answer: "Basic programming knowledge is enough for many student engineering internships, especially when paired with eagerness to learn." },
      { question: "What tech stacks are common?", answer: "Internships often involve React, Node.js, Python, data engineering, and product-focused tooling." },
      { question: "Can I get remote engineering experience?", answer: "Yes. Many engineering internships are remote or hybrid to support student flexibility." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Backend Engineering Internship", subtitle: "Build APIs, databases, and systems for product teams.", url: "/software-internships" },
      { title: "Cloud Internship", subtitle: "Work on scalable infrastructure and tools.", url: "/engineering-internships" },
      { title: "Career Roadmap for Engineers", subtitle: "Plan your next engineering milestone.", url: "/ai-career-roadmap" },
    ],
  },
  "student-network": {
    title: "Student Network & Profiles | CampusConnect",
    description:
      "Join a student community for networking, mentorship, verified profiles, and opportunity sharing with employers and campus leaders.",
    keywords: ["student network", "student profiles", "campus networking", "student community", "mentor network"],
    heroTitle: "Build your student network with verified career profiles",
    heroSubtitle:
      "Connect with employers, mentors, and peers through verified profiles, project portfolios, and networking recommendations.",
    primaryCta: { label: "Join the Network", href: "/student-network" },
    secondaryCta: { label: "Browse Internships", href: "/internships" },
    benefits: [
      { title: "Verified student credibility", description: "Earn badges and trust signals that boost employer discovery." },
      { title: "Peer networking", description: "Connect with campus leaders, mentors, and student hiring teams." },
      { title: "Portfolio visibility", description: "Showcase projects, skills, and internship success stories." },
    ],
    faqs: [
      { question: "How do I create a student profile?", answer: "Sign up, verify your college email, add skills, and list your campus experience and projects." },
      { question: "Can employers discover me?", answer: "Yes. Verified profiles appear in employer search and AI talent matching." },
      { question: "Is networking private?", answer: "You control your profile visibility and employer interactions while building your professional presence." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Verified Student Badges", subtitle: "Earn credibility with academic verification.", url: "/trust" },
      { title: "Mentor Matching", subtitle: "Connect with career mentors and founders.", url: "/mentor" },
      { title: "Internship Opportunities", subtitle: "See verified roles from startups.", url: "/internships" },
    ],
  },
  "ai-career-roadmap": {
    title: "AI Career Roadmap for Students | CampusConnect",
    description:
      "Plan your student career with AI-powered roadmaps, skill milestones, and recommended internships to reach your goals faster.",
    keywords: ["AI career roadmap", "career guidance", "student career planning", "skill roadmap", "internship pathways"],
    heroTitle: "Personalized AI career roadmaps for students",
    heroSubtitle:
      "Get a step-by-step plan for internships, campus gigs, skills, and networking based on your goals and student background.",
    primaryCta: { label: "Start Your AI Roadmap", href: "/ai-career-roadmap" },
    secondaryCta: { label: "Find Opportunities", href: "/internships" },
    benefits: [
      { title: "Goal-based planning", description: "Build a roadmap that aligns internships, skills, and career milestones." },
      { title: "AI recommendations", description: "Receive role and skill suggestions based on your profile and interests." },
      { title: "Progress tracking", description: "Monitor your growth across internships, projects, and network connections." },
    ],
    faqs: [
      { question: "How does the AI roadmap work?", answer: "CampusConnect analyzes your skills, goals, and student profile to recommend the right internships and learning steps." },
      { question: "Can I update my roadmap?", answer: "Yes. Your roadmap evolves as you complete internships, earn badges, and add new skills." },
      { question: "Will this help me choose a career path?", answer: "Yes. The roadmap is designed to surface internships and projects that support student career decisions." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Career Roadmap Guide", subtitle: "See how students build meaningful career plans.", url: "/editorial" },
      { title: "Trending Skills", subtitle: "Discover high-demand skills for students.", url: "/skills" },
      { title: "Internships Near You", subtitle: "Find roles that fit your college city.", url: "/internships" },
    ],
  },
  "hire-student-talent": {
    title: "Hire Student Talent | CampusConnect Employers",
    description:
      "Hire verified students for internships, campus gigs, freelance work, and campus ambassador programs using AI matching and verified profiles.",
    keywords: ["hire students", "employer hiring", "student talent", "campus recruitment", "intern hiring"],
    heroTitle: "Hire student talent faster with AI matching",
    heroSubtitle:
      "Connect with verified students, review project portfolios, and fill internships, freelance projects, and campus gigs with confidence.",
    primaryCta: { label: "Post a Role", href: "/post-gig" },
    secondaryCta: { label: "Search Talent", href: "/employer/talent-search" },
    benefits: [
      { title: "Verified student pool", description: "Hire from a curated talent marketplace with student verification and reputation signals." },
      { title: "AI matching for employers", description: "Get recommended candidates based on skills, college, and work preferences." },
      { title: "Flexible hiring formats", description: "Post internships, freelance projects, campus gigs, and hiring drives." },
    ],
    faqs: [
      { question: "What types of student roles can I post?", answer: "You can post internships, freelance jobs, campus gigs, ambassador roles, and project-based opportunities." },
      { question: "How does CampusConnect protect payments?", answer: "Escrow secures employer funds until student work is delivered and approved." },
      { question: "Can I hire students from multiple colleges?", answer: "Yes. Filter candidates by college, skills, and location to reach the right student talent." },
    ],
    relatedLinks: commonRelatedLinks,
    featuredCards: [
      { title: "Student Developer Talent", subtitle: "Hire emerging software and engineering talent.", url: "/employer/talent-search" },
      { title: "Campus Ambassador Programs", subtitle: "Launch student-led ambassador teams.", url: "/campus-gigs" },
      { title: "Employer Hiring Guide", subtitle: "Learn how to attract and retain student hires.", url: "/employer/upgrade" },
    ],
  },
}

export const SEO_LANDING_PAGE_SLUGS = Object.keys(SEO_LANDING_PAGES)
