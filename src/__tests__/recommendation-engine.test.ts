import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from '@/lib/recommendation-engine/engine';
import { StudentProfileGraph } from '@/lib/recommendation-engine/core/StudentProfile';
import { OpportunityNode } from '@/lib/recommendation-engine/core/OpportunityGraph';

describe('Recommendation Engine Deterministic Scoring (Phase 12)', () => {
  const studentProfile: StudentProfileGraph = {
    id: 'student-123',
    skills: ['react', 'typescript', 'nextjs', 'tailwind'],
    interests: ['web development'],
    degree: 'B.Tech',
    branch: 'CSE',
    graduationYear: '2026',
    preferredCities: ['hyderabad'],
    preferredCompanies: [],
    careerGoals: ['frontend developer'],
    languages: ['English'],
    certifications: [],
    previousApplications: [],
    savedOpportunities: [],
    viewedOpportunities: [],
    searchHistory: [],
    latitude: 17.3850,
    longitude: 78.4867,
    collegeName: 'IIT Hyderabad',
    collegeLatitude: 17.5947,
    collegeLongitude: 78.1230,
  };

  it('should score an opportunity with high skill match and close proximity deterministically', () => {
    const engine = new RecommendationEngine(studentProfile);

    const opportunity: OpportunityNode = {
      id: 'opp-1',
      type: 'gig',
      title: 'Frontend React Next.js Developer',
      company: 'Campus Startup',
      requiredSkills: ['react', 'typescript', 'nextjs'],
      difficulty: 'intermediate',
      location: 'Hyderabad',
      city: 'hyderabad',
      latitude: 17.3900, // Very close to student (< 5km)
      longitude: 78.4900,
      domain: 'Engineering',
      salary: 15000,
      experienceLevel: 'student',
      tags: ['react', 'nextjs'],
      isRemote: false,
      isHybrid: false,
      category: 'engineering',
      createdAt: new Date(), // Today (freshness = 10)
      popularityScore: 50,
    };

    const [rec] = engine.generateRecommendations([opportunity], 1);
    expect(rec).toBeDefined();
    // Skills match: 3/3 = 100% -> 60 points
    // Proximity: < 15km -> 30 points
    // Freshness: day 0 -> 10 points
    // Total = 100 points
    expect(rec.totalScore).toBe(100);
    expect(rec.matchMetrics.skillScore).toBe(60);
    expect(rec.matchMetrics.proximityScore).toBe(30);
    expect(rec.matchMetrics.freshnessScore).toBe(10);
    expect(rec.explanation.toLowerCase()).toContain('matches 3 of your skills');
  });

  it('should give 25 proximity points for remote opportunities', () => {
    const engine = new RecommendationEngine(studentProfile);

    const remoteOpp: OpportunityNode = {
      id: 'opp-remote',
      type: 'internship',
      title: 'Remote React Intern',
      company: 'Distributed Labs',
      requiredSkills: ['react'],
      difficulty: 'beginner',
      location: 'Remote',
      city: null,
      latitude: null,
      longitude: null,
      domain: 'Engineering',
      salary: 20000,
      experienceLevel: 'entry-level',
      tags: ['react'],
      isRemote: true,
      isHybrid: false,
      category: 'internship',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days old -> freshness = 7
      popularityScore: 20,
    };

    const [rec] = engine.generateRecommendations([remoteOpp], 1);
    expect(rec.matchMetrics.proximityScore).toBe(25);
    expect(rec.matchMetrics.freshnessScore).toBe(7);
    expect(rec.explanation.toLowerCase()).toContain('remote');
  });

  it('should be strictly deterministic with 0 synthetic randomness', () => {
    const engine = new RecommendationEngine(studentProfile);

    const opp: OpportunityNode = {
      id: 'opp-deterministic',
      type: 'gig',
      title: 'Python Data Scraper',
      company: 'Analytics Co',
      requiredSkills: ['python', 'pandas'],
      difficulty: 'intermediate',
      location: 'Delhi',
      city: 'delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      domain: 'Data',
      salary: 8000,
      experienceLevel: 'student',
      tags: ['python'],
      isRemote: false,
      isHybrid: false,
      category: 'freelance',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days old -> freshness = 1
      popularityScore: 10,
    };

    // Run 5 times and verify score is identical every time
    const scores = Array.from({ length: 5 }).map(() => {
      const [r] = engine.generateRecommendations([opp], 1);
      return r.totalScore;
    });

    expect(new Set(scores).size).toBe(1);
  });

  it('should rank related opportunities by shared skills, work mode, and proximity', () => {
    const current: OpportunityNode = {
      id: 'current-gig',
      type: 'gig',
      title: 'React UI Developer',
      company: 'TechCorp',
      requiredSkills: ['react', 'css', 'typescript'],
      difficulty: 'intermediate',
      location: 'Hyderabad',
      city: 'hyderabad',
      latitude: 17.3850,
      longitude: 78.4867,
      domain: 'Engineering',
      salary: 10000,
      experienceLevel: 'student',
      tags: ['react', 'ui'],
      isRemote: false,
      isHybrid: false,
      category: 'engineering',
      createdAt: new Date(),
      popularityScore: 10,
    };

    const pool: OpportunityNode[] = [
      current,
      {
        id: 'related-1', // Shared skills & same city
        type: 'gig',
        title: 'Next.js Frontend Engineer',
        company: 'Campus Startup',
        requiredSkills: ['react', 'typescript'],
        difficulty: 'intermediate',
        location: 'Hyderabad',
        city: 'hyderabad',
        latitude: 17.3900,
        longitude: 78.4900,
        domain: 'Engineering',
        salary: 12000,
        experienceLevel: 'student',
        tags: ['react'],
        isRemote: false,
        isHybrid: false,
        category: 'engineering',
        createdAt: new Date(),
        popularityScore: 20,
      },
      {
        id: 'unrelated-2', // Different skills, different location
        type: 'gig',
        title: 'Content Writer',
        company: 'Media House',
        requiredSkills: ['copywriting', 'seo'],
        difficulty: 'beginner',
        location: 'Mumbai',
        city: 'mumbai',
        latitude: 19.0760,
        longitude: 72.8777,
        domain: 'Content',
        salary: 5000,
        experienceLevel: 'student',
        tags: ['content'],
        isRemote: false,
        isHybrid: false,
        category: 'content',
        createdAt: new Date(),
        popularityScore: 5,
      }
    ];

    const related = RecommendationEngine.rankRelatedOpportunities(current, pool, 2);
    expect(related.length).toBe(2);
    expect(related[0].id).toBe('related-1'); // Most relevant must rank first
  });
});
