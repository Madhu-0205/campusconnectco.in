import { Article, Author, TopicCluster } from"./types";

export const AUTHORS: Record<string, Author> = {
"campusconnect-editorial": {
 id:"campusconnect-editorial",
 name:"CampusConnect Editorial Team",
 role:"Content Integrity Board",
 avatarUrl:"/logo-v2.jpg",
 bio:"The central editorial board dedicated to researching, fact-checking, and publishing actionable career advice for Indian college students.",
 },
"madhu-v": {
 id:"madhu-v",
 name:"Madhu V",
 role:"Senior Growth Lead",
 avatarUrl:"/logo-v2.jpg",
 bio:"Former startup engineer now helping millions of students navigate their early careers through data-driven insights.",
 },
};

export const TOPIC_CLUSTERS: TopicCluster[] = [
 {
 slug:"artificial-intelligence",
 name:"Artificial Intelligence",
 description:"The definitive hub for student AI careers, LLM internships, and prompt engineering resources.",
 hubIcon:"BrainCircuit",
 coreKeywords: ["Machine Learning","LLMs","Data Science","Python","Generative AI"],
 associatedSkills: ["python","tensorflow","pytorch"],
 associatedRoles: ["ai-engineer","data-scientist"],
 },
 {
 slug:"frontend-engineering",
 name:"Frontend Engineering",
 description:"Master React, Next.js, and modern UI engineering. Build fast, accessible, and dynamic user interfaces.",
 hubIcon:"Layout",
 coreKeywords: ["React","Next.js","Web Performance","Accessibility","Tailwind CSS"],
 associatedSkills: ["react","nextjs","figma","tailwind-css"],
 associatedRoles: ["frontend-developer","ui-ux-designer"],
 },
 {
 slug:"product-management",
 name:"Product Management",
 description:"Launch products users love. Learn agile, user research, wireframing, and metric tracking.",
 hubIcon:"Target",
 coreKeywords: ["Agile","User Research","Wireframing","Growth Metrics"],
 associatedSkills: ["user-research","figma","landing-page-ux"],
 associatedRoles: ["product-manager"],
 },
];

export const ARTICLES: Article[] = [
 {
 slug:"ai-engineer-roadmap-2027",
 category:"roadmaps",
 title:"The Ultimate AI Engineer Roadmap for College Students",
 description:"A step-by-step guide to learning machine learning, deploying LLMs, and landing your first AI internship.",
 content: `
## 1. The Foundation: Math & Python
Before diving into neural networks, you need a solid grasp of Linear Algebra, Calculus, and Python. Focus on libraries like NumPy and Pandas to manipulate data efficiently.

## 2. Machine Learning Basics
Understand classical ML algorithms: Linear Regression, Decision Trees, and Support Vector Machines. Don't skip this — they form the intuition behind modern AI.

## 3. Deep Learning & Frameworks
Learn PyTorch or TensorFlow. Start building basic multi-layer perceptrons and move towards CNNs and RNNs.

## 4. Large Language Models (LLMs)
The current meta is Generative AI. Learn how to prompt effectively, use LangChain or LlamaIndex, and implement RAG (Retrieval-Augmented Generation) pipelines.

## 5. Deployment
Build a portfolio by deploying your models as REST APIs using FastAPI and Docker. Host them on AWS, Vercel, or Render.
 `,
 readingTimeMinutes: 8,
 publishedAt:"2026-07-20T00:00:00Z",
 updatedAt:"2026-07-25T00:00:00Z",
 authorId:"campusconnect-editorial",
 relatedTopics: ["artificial-intelligence"],
 relatedArticles: ["how-to-write-a-tech-resume"],
 },
 {
 slug:"how-to-write-a-tech-resume",
 category:"resume-tips",
 title:"How to Write a Tech Resume that Beats ATS (Applicant Tracking Systems)",
 description:"Learn how to format your engineering resume to pass automated screens and impress hiring managers.",
 content: `
## The Importance of ATS
Applicant Tracking Systems (ATS) automatically parse your resume. If it can't read your layout, you get automatically rejected.

## 1. Single Column Layout
Always use a single-column layout. Multi-column resumes break parsers.

## 2. Emphasize Impact, Not Just Duties
Use the XYZ formula:"Accomplished [X] as measured by [Y], by doing [Z]."
*Example:*"Reduced API latency by 40% by migrating database queries to Redis."

## 3. Include a Portfolio Link
Link to your GitHub, Live Projects, and CampusConnect Profile.
 `,
 readingTimeMinutes: 5,
 publishedAt:"2026-06-15T00:00:00Z",
 updatedAt:"2026-07-10T00:00:00Z",
 authorId:"madhu-v",
 relatedTopics: ["frontend-engineering","artificial-intelligence","product-management"],
 relatedArticles: ["ai-engineer-roadmap-2027"],
 },
];
