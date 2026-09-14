import { describe, it, expect } from 'vitest';
import { parseSearchIntent } from '@/lib/search/intent';

describe('Search Intent Parser (Phase 12)', () => {
  it('should parse compound query with keyword, type, and location', () => {
    const result = parseSearchIntent('react internships in hyderabad');
    expect(result.type).toBe('internship');
    expect(result.location).toBe('hyderabad');
    expect(result.keyword).toContain('react');
    expect(result.detectedFilters.type).toBe('internship');
    expect(result.detectedFilters.location).toBe('hyderabad');
  });

  it('should detect remote work mode and gig type', () => {
    const result = parseSearchIntent('remote frontend gigs');
    expect(result.type).toBe('gig');
    expect(result.workMode).toBe('remote');
    expect(result.keyword).toContain('frontend');
    expect(result.detectedFilters.workMode).toBe('remote');
    expect(result.detectedFilters.type).toBe('gig');
  });

  it('should detect near me query intent', () => {
    const result = parseSearchIntent('ui ux designer near me');
    expect(result.nearMe).toBe(true);
    expect(result.keyword).toContain('ui ux designer');
    expect(result.detectedFilters.nearMe).toBe(true);
  });

  it('should normalize city aliases (bangalore -> bengaluru)', () => {
    const result = parseSearchIntent('python developer in bangalore');
    expect(result.location).toBe('bengaluru');
    expect(result.keyword).toContain('python developer');
  });

  it('should handle pure keyword queries gracefully without false filters', () => {
    const result = parseSearchIntent('full stack typescript');
    expect(result.type).toBe('all');
    expect(result.workMode).toBe('all');
    expect(result.location).toBeNull();
    expect(result.nearMe).toBe(false);
    expect(result.keyword).toBe('full stack typescript');
  });

  it('should handle empty or whitespace query safely', () => {
    const result = parseSearchIntent('   ');
    expect(result.keyword).toBe('');
    expect(result.type).toBe('all');
  });
});
