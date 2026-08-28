export interface InternshipCategory {
 slug: string;
 name: string;
 description: string;
 keywords: string[];
 topSkills: string[];
 averageStipend: number;
}

export interface CompanySEOData {
 slug: string;
 name: string;
 industry: string;
 headquarters: string;
 description: string;
 techStack: string[];
 openRolesCount: number;
}

export interface CareerPath {
 slug: string;
 title: string;
 category: string;
 description: string;
 salaryRange: string;
 prerequisiteSkills: string[];
 recommendedRoadmap: string[];
}

export const INTERNSHIP_CATEGORIES: InternshipCategory[] = [
 {
 slug:"software-development",
 name:"Software Development",
 description:"Build scalable web services, APIs, and microservices for high-growth tech startups.",
 keywords: ["software development internship","full stack developer intern","backend internship","frontend internship"],
 topSkills: ["React","Next.js","Node.js","Python","TypeScript"],
 averageStipend: 25000,
 },
 {
 slug:"data-science",
 name:"Data Science & AI",
 description:"Train machine learning models, build LLM pipelines, and analyze big data for real business insights.",
 keywords: ["data science internship","ai intern","machine learning internship","python data intern"],
 topSkills: ["Python","PyTorch","TensorFlow","SQL","Pandas"],
 averageStipend: 28000,
 },
 {
 slug:"graphic-design",
 name:"Graphic Design & Branding",
 description:"Create brand identities, social media visual assets, and marketing graphics for digital startups.",
 keywords: ["graphic design internship","branding intern","creative designer intern","figma graphic intern"],
 topSkills: ["Figma","Photoshop","Illustrator","Branding","UI Design"],
 averageStipend: 18000,
 },
 {
 slug:"ui-ux-design",
 name:"UI/UX & Product Design",
 description:"Design user journeys, interactive wireframes, design systems, and mobile application interfaces.",
 keywords: ["ui ux internship","product design intern","figma design internship","ux research intern"],
 topSkills: ["Figma","User Research","Wireframing","Prototyping","Design Systems"],
 averageStipend: 22000,
 },
 {
 slug:"marketing",
 name:"Digital Marketing & Growth",
 description:"Drive user acquisition, perform SEO content optimizations, run performance ads, and execute growth loops.",
 keywords: ["digital marketing internship","growth marketing intern","social media internship","seo intern"],
 topSkills: ["SEO","Google Analytics","Social Media","Content Strategy","Performance Marketing"],
 averageStipend: 16000,
 },
 {
 slug:"product-management",
 name:"Product Management",
 description:"Define product requirements, collaborate with engineering teams, and deliver user-centric features.",
 keywords: ["product management internship","associate product manager intern","pm internship"],
 topSkills: ["User Research","Agile","Wireframing","Data Analytics","Product Strategy"],
 averageStipend: 26000,
 },
 {
 slug:"content-writing",
 name:"Content Writing & Copywriting",
 description:"Write technical articles, landing page copy, product blogs, and engaging social content.",
 keywords: ["content writing internship","copywriting intern","technical writer intern"],
 topSkills: ["Content Strategy","SEO Writing","Copywriting","Editing","Research"],
 averageStipend: 15000,
 },
 {
 slug:"finance",
 name:"Finance & Venture Research",
 description:"Perform financial modeling, startup equity research, valuation metrics, and financial reporting.",
 keywords: ["finance internship","venture capital intern","financial analyst internship"],
 topSkills: ["Financial Modeling","Excel","Valuation","Accounting","Data Analysis"],
 averageStipend: 20000,
 },
];

export const COMPANIES_DATASET: CompanySEOData[] = [
 {
 slug:"razorpay",
 name:"Razorpay",
 industry:"Fintech & Payments",
 headquarters:"Bangalore, KA",
 description:"India's leading financial services platform automating payments and banking operations for online businesses.",
 techStack: ["React","Node.js","Go","AWS","MySQL"],
 openRolesCount: 8,
 },
 {
 slug:"swiggy",
 name:"Swiggy",
 industry:"Consumer Tech & Quick Commerce",
 headquarters:"Bangalore, KA",
 description:"Hyperlocal on-demand convenience platform enabling food delivery, Instamart groceries, and logistics.",
 techStack: ["Java","Go","React Native","Kafka","Redis"],
 openRolesCount: 12,
 },
 {
 slug:"zomato",
 name:"Zomato",
 industry:"Foodtech & Logistics",
 headquarters:"Gurugram, HR",
 description:"Global restaurant discovery, online food ordering, and quick-commerce logistics network.",
 techStack: ["Python","Node.js","React","PostgreSQL","Flutter"],
 openRolesCount: 10,
 },
 {
 slug:"cred",
 name:"CRED",
 industry:"Fintech & Luxury Commerce",
 headquarters:"Bangalore, KA",
 description:"Members-only credit card reward platform empowering creditworthy individuals in India.",
 techStack: ["Kotlin","Swift","React","Go","Microservices"],
 openRolesCount: 6,
 },
 {
 slug:"zepto",
 name:"Zepto",
 industry:"Quick Commerce",
 headquarters:"Mumbai, MH",
 description:"India's fastest-growing 10-minute grocery delivery startup backed by top global venture funds.",
 techStack: ["Node.js","React","Python","PostgreSQL","Redis"],
 openRolesCount: 14,
 },
 {
 slug:"postman",
 name:"Postman",
 industry:"Developer Tools & API Platform",
 headquarters:"Bangalore / San Francisco",
 description:"The leading API platform used by over 30 million developers globally to build and test APIs.",
 techStack: ["Electron","React","Node.js","TypeScript","GraphQL"],
 openRolesCount: 5,
 },
 {
 slug:"meesho",
 name:"Meesho",
 industry:"E-Commerce",
 headquarters:"Bangalore, KA",
 description:"India's leading internet commerce ecosystem democratizing retail for micro-entrepreneurs and tier-2/3 buyers.",
 techStack: ["Java","Python","React","Kafka","Cassandra"],
 openRolesCount: 9,
 },
 {
 slug:"groww",
 name:"Groww",
 industry:"Wealthtech & Investing",
 headquarters:"Bangalore, KA",
 description:"Financial technology startup providing stock trading, mutual funds, and wealth management services.",
 techStack: ["React","Spring Boot","Go","PostgreSQL","Kubernetes"],
 openRolesCount: 7,
 },
];

export const CAREER_PATHS: CareerPath[] = [
 {
 slug:"full-stack-developer",
 title:"Full Stack Developer",
 category:"Software Engineering",
 description:"Master frontend component architecture, backend REST/GraphQL APIs, database migrations, and cloud deployment.",
 salaryRange:"₹6,00,000 - ₹18,00,000 / year",
 prerequisiteSkills: ["React","Next.js","Node.js","TypeScript","PostgreSQL"],
 recommendedRoadmap: [
"Learn HTML/CSS and Vanilla JavaScript Fundamentals",
"Build React Single-Page Applications & Hooks",
"Master Server-Side Rendering with Next.js",
"Design Node.js REST APIs and Database Schemas",
"Deploy apps with Vercel, Supabase, and CI/CD pipelines"
 ],
 },
 {
 slug:"data-analyst",
 title:"Data Analyst",
 category:"Data & Analytics",
 description:"Transform raw corporate datasets into actionable metrics using SQL, Python, Excel, and interactive dashboards.",
 salaryRange:"₹5,00,000 - ₹14,00,000 / year",
 prerequisiteSkills: ["SQL","Python","Excel","Tableau","Pandas"],
 recommendedRoadmap: [
"Master Advanced SQL Queries and Aggregations",
"Learn Python Data Analysis libraries (Pandas, NumPy)",
"Build Interactive Business Dashboards in PowerBI or Tableau",
"Understand Statistical Hypothesis Testing",
"Execute End-to-End Business Case Studies"
 ],
 },
 {
 slug:"ui-ux-designer",
 title:"UI/UX Designer",
 category:"Product Design",
 description:"Craft high-converting user interfaces, conduct user research interviews, and create component design systems.",
 salaryRange:"₹5,50,000 - ₹16,00,000 / year",
 prerequisiteSkills: ["Figma","User Research","Wireframing","Prototyping","Design Systems"],
 recommendedRoadmap: [
"Study Design Principles, Typography, & Color Contrast",
"Master Figma Component Architecture and Auto Layout",
"Conduct User Research & Synthesize Journey Maps",
"Build High-Fidelity Interactive Prototypes",
"Publish a Case Study Portfolio on Behance / Personal Web"
 ],
 },
 {
 slug:"product-manager",
 title:"Product Manager",
 category:"Product Management",
 description:"Lead product discovery, write feature PRDs, prioritize engineering roadmaps, and optimize conversion metrics.",
 salaryRange:"₹8,00,000 - ₹24,00,000 / year",
 prerequisiteSkills: ["User Research","Wireframing","Data Analytics","Product Strategy","Agile"],
 recommendedRoadmap: [
"Understand Product Lifecycle and Agile Methodologies",
"Write PRDs and User Stories with Acceptance Criteria",
"Perform Competitor Analysis & Market Research",
"Analyze Conversion Funnels with Analytics Tools",
"Ship MVP Products with Cross-Functional Student Teams"
 ],
 },
 {
 slug:"ai-engineer",
 title:"AI Engineer",
 category:"Artificial Intelligence",
 description:"Build LLM applications, fine-tune neural networks, implement RAG systems, and deploy AI models to production.",
 salaryRange:"₹10,00,000 - ₹30,00,000 / year",
 prerequisiteSkills: ["Python","PyTorch","TensorFlow","OpenAI API","Vector Databases"],
 recommendedRoadmap: [
"Deep Dive into Python, Linear Algebra, and Calculus",
"Implement Machine Learning Algorithms from Scratch",
"Train Neural Networks using PyTorch or TensorFlow",
"Build RAG Applications with LangChain / LlamaIndex",
"Deploy AI APIs with FastAPI and Docker"
 ],
 },
];
