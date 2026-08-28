export interface Author {
 id: string;
 name: string;
 role: string;
 avatarUrl: string;
 bio: string;
}

export interface Article {
 slug: string;
 category: string; // 'career-guides', 'roadmaps', 'interview-prep', 'resume-tips', 'success-stories'
 title: string;
 description: string;
 content: string; // Markdown or HTML representation
 readingTimeMinutes: number;
 publishedAt: string;
 updatedAt: string;
 authorId: string;
 relatedTopics: string[]; // Topic slugs
 relatedArticles: string[]; // Article slugs
}

export interface TopicCluster {
 slug: string; // 'artificial-intelligence', 'frontend', 'product-management'
 name: string;
 description: string;
 hubIcon: string;
 coreKeywords: string[];
 associatedSkills: string[]; // Skill slugs (e.g. 'react', 'python')
 associatedRoles: string[]; // Career slugs (e.g. 'ai-engineer')
}
