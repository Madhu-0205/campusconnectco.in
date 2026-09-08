/**
 * scripts/enrich-opportunity-coordinates.js
 * 
 * Deterministic, idempotent, non-destructive coordinate enrichment for CampusConnect opportunities.
 * - Enriches ONLY records with missing coordinates (latitude === null || longitude === null).
 * - NEVER overwrites existing valid coordinates.
 * - Extracts real city names from `city` or `location` strings.
 * - Uses standard city-level centroid coordinates (classified as 'city_approximate').
 * - Produces an auditable before/after report with record-level change summaries.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Canonical city lookup with official state and approximate centroid coordinates
const CANONICAL_CITIES = {
  bangalore: { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  bengaluru: { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  pune: { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  mumbai: { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  'navi mumbai': { name: 'Navi Mumbai', state: 'Maharashtra', lat: 19.0330, lng: 73.0297 },
  delhi: { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  'new delhi': { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  'west delhi': { name: 'West Delhi', state: 'Delhi', lat: 28.6667, lng: 77.0833 },
  hyderabad: { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  hyd: { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  chennai: { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  salem: { name: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460 },
  bhopal: { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  indore: { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  gurugram: { name: 'Gurugram', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  gurgaon: { name: 'Gurugram', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  chandigarh: { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  surampalem: { name: 'Surampalem', state: 'Andhra Pradesh', lat: 17.0673, lng: 82.2612 },
  kolkata: { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  noida: { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910 }
};

function resolveCityFromText(text) {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/in office\s*\|\s*/g, '').replace(/hybrid\s*\|\s*/g, '').trim();
  
  // Check exact keys first
  for (const [key, cityInfo] of Object.entries(CANONICAL_CITIES)) {
    // Word boundary or containment check
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(clean)) {
      return cityInfo;
    }
  }
  return null;
}

async function runEnrichment() {
  console.log('====================================================');
  console.log('STARTING AUDITABLE OPPORTUNITY COORDINATE ENRICHMENT');
  console.log('====================================================\n');

  // 1. Before counts
  const totalGigs = await prisma.gig.count();
  const gigsWithCoordsBefore = await prisma.gig.count({ where: { latitude: { not: null }, longitude: { not: null } } });

  const totalInternships = await prisma.internship.count();
  const internshipsWithCoordsBefore = await prisma.internship.count({ where: { latitude: { not: null }, longitude: { not: null } } });

  console.log('--- BEFORE ENRICHMENT ---');
  console.log(`Gigs: ${gigsWithCoordsBefore}/${totalGigs} with coordinates`);
  console.log(`Internships: ${internshipsWithCoordsBefore}/${totalInternships} with coordinates\n`);

  const changelog = [];

  // 2. Process Gigs with missing coordinates
  const missingGigs = await prisma.gig.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null }
      ]
    },
    select: { id: true, title: true, city: true, state: true, latitude: true, longitude: true }
  });

  for (const gig of missingGigs) {
    // Try resolving from city
    const resolved = resolveCityFromText(gig.city);
    if (resolved) {
      await prisma.gig.update({
        where: { id: gig.id },
        data: {
          latitude: resolved.lat,
          longitude: resolved.lng,
          city: gig.city || resolved.name,
          state: gig.state || resolved.state
        }
      });
      changelog.push({
        type: 'gig',
        id: gig.id,
        title: gig.title,
        source: gig.city,
        action: 'ENRICHED',
        coordinateSource: 'city-level approximate',
        coordinates: { lat: resolved.lat, lng: resolved.lng },
        city: resolved.name,
        state: resolved.state
      });
    }
  }

  // 3. Process Internships with missing coordinates
  const missingInternships = await prisma.internship.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null }
      ]
    },
    select: { id: true, title: true, city: true, state: true, location: true, latitude: true, longitude: true }
  });

  for (const int of missingInternships) {
    // Try resolving from location string or city
    const resolved = resolveCityFromText(int.location) || resolveCityFromText(int.city);
    if (resolved) {
      await prisma.internship.update({
        where: { id: int.id },
        data: {
          latitude: resolved.lat,
          longitude: resolved.lng,
          city: int.city || resolved.name,
          state: int.state || resolved.state
        }
      });
      changelog.push({
        type: 'internship',
        id: int.id,
        title: int.title,
        source: int.location || int.city,
        action: 'ENRICHED',
        coordinateSource: 'city-level approximate',
        coordinates: { lat: resolved.lat, lng: resolved.lng },
        city: resolved.name,
        state: resolved.state
      });
    }
  }

  // 4. After counts
  const gigsWithCoordsAfter = await prisma.gig.count({ where: { latitude: { not: null }, longitude: { not: null } } });
  const internshipsWithCoordsAfter = await prisma.internship.count({ where: { latitude: { not: null }, longitude: { not: null } } });

  console.log('--- ENRICHMENT AUDIT LOG ---');
  console.log(`Total records enriched: ${changelog.length}`);
  console.table(changelog.map(c => ({
    Type: c.type,
    Title: c.title.slice(0, 30),
    Source: c.source,
    City: c.city,
    Coordinates: `${c.coordinates.lat}, ${c.coordinates.lng}`,
    Precision: c.coordinateSource
  })));

  console.log('\n--- AFTER ENRICHMENT ---');
  console.log(`Gigs: ${gigsWithCoordsAfter}/${totalGigs} with coordinates (was ${gigsWithCoordsBefore})`);
  console.log(`Internships: ${internshipsWithCoordsAfter}/${totalInternships} with coordinates (was ${internshipsWithCoordsBefore})\n`);
  console.log('Enrichment complete. Idempotent & safe to rerun.');
}

runEnrichment()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
