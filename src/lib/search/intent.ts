/**
 * Deterministic search intent parser for CampusConnectCo.
 * 
 * Extracts structured filters (type, work mode, location, near-me)
 * from natural search queries without external AI or synthetic guesswork.
 */

export interface ParsedSearchIntent {
  rawQuery: string;
  keyword: string;
  type: 'all' | 'gig' | 'internship';
  workMode: 'all' | 'remote' | 'hybrid' | 'on-site';
  location: string | null;
  nearMe: boolean;
  detectedFilters: {
    type?: 'gig' | 'internship';
    workMode?: 'remote' | 'hybrid' | 'on-site';
    location?: string;
    nearMe?: boolean;
  };
}

// Known cities with opportunities or recognized student tech hubs in India
const KNOWN_CITIES = [
  'hyderabad',
  'bengaluru',
  'bangalore',
  'surampalem',
  'mumbai',
  'delhi',
  'pune',
  'chennai',
  'kolkata',
  'noida',
  'gurugram',
  'gurgaon',
  'vijayawada',
  'visakhapatnam',
  'vizag',
  'kochi',
  'ahmedabad',
  'chandigarh',
  'jaipur'
];

export function parseSearchIntent(rawQuery: string): ParsedSearchIntent {
  const trimmed = (rawQuery || '').trim();
  if (!trimmed) {
    return {
      rawQuery: '',
      keyword: '',
      type: 'all',
      workMode: 'all',
      location: null,
      nearMe: false,
      detectedFilters: {}
    };
  }

  let working = ` ${trimmed.toLowerCase()} `;
  const detectedFilters: ParsedSearchIntent['detectedFilters'] = {};

  // 1. Detect Near Me
  let nearMe = false;
  if (/\b(near\s+me|nearby|around\s+me|close\s+to\s+me|my\s+location)\b/i.test(working)) {
    nearMe = true;
    detectedFilters.nearMe = true;
    working = working.replace(/\b(near\s+me|nearby|around\s+me|close\s+to\s+me|my\s+location)\b/gi, ' ');
  }

  // 2. Detect Type (internship vs gig/project/freelance)
  let type: 'all' | 'gig' | 'internship' = 'all';
  if (/\b(internships?|interns?)\b/i.test(working)) {
    type = 'internship';
    detectedFilters.type = 'internship';
    working = working.replace(/\b(internships?|interns?)\b/gi, ' ');
  } else if (/\b(gigs?|campus\s+gigs?|freelance|tasks?|projects?)\b/i.test(working)) {
    type = 'gig';
    detectedFilters.type = 'gig';
    working = working.replace(/\b(gigs?|campus\s+gigs?|freelance|tasks?|projects?)\b/gi, ' ');
  }

  // 3. Detect Work Mode (remote vs hybrid vs on-site)
  let workMode: 'all' | 'remote' | 'hybrid' | 'on-site' = 'all';
  if (/\b(remote|work\s+from\s+home|wfh|virtual|online)\b/i.test(working)) {
    workMode = 'remote';
    detectedFilters.workMode = 'remote';
    working = working.replace(/\b(remote|work\s+from\s+home|wfh|virtual|online)\b/gi, ' ');
  } else if (/\b(hybrid)\b/i.test(working)) {
    workMode = 'hybrid';
    detectedFilters.workMode = 'hybrid';
    working = working.replace(/\b(hybrid)\b/gi, ' ');
  } else if (/\b(in-person|in\s+person|on-site|onsite|office)\b/i.test(working)) {
    workMode = 'on-site';
    detectedFilters.workMode = 'on-site';
    working = working.replace(/\b(in-person|in\s+person|on-site|onsite|office)\b/gi, ' ');
  }

  // 4. Detect Location (e.g. "in hyderabad", "in surampalem", "at bengaluru")
  let location: string | null = null;
  for (const city of KNOWN_CITIES) {
    const cityRegex = new RegExp(`\\b(?:in|at|around)\\s+(${city})\\b|\\b(${city})\\b`, 'i');
    if (cityRegex.test(working)) {
      // Normalize aliases
      if (city === 'bangalore') location = 'bengaluru';
      else if (city === 'gurgaon') location = 'gurugram';
      else if (city === 'vizag') location = 'visakhapatnam';
      else location = city;

      detectedFilters.location = location;
      working = working.replace(cityRegex, ' ');
      break;
    }
  }

  // 5. Clean up connector words and extra spaces for clean keyword extraction
  working = working
    .replace(/\b(in|at|for|with|and|or|looking\s+for|jobs?|openings?)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    rawQuery: trimmed,
    keyword: working,
    type,
    workMode,
    location,
    nearMe,
    detectedFilters
  };
}
