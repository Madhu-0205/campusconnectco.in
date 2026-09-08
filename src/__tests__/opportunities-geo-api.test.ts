import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUnifiedOpportunities } from '@/lib/opportunities/fetcher'

const mockGigs = [
  {
    id: 'gig-blr-1',
    title: 'Bengaluru Campus Ambassador',
    description: 'Help coordinate campus activities in Bengaluru',
    budget: 5000,
    deadline: new Date('2026-12-31'),
    status: 'OPEN',
    tags: ['marketing'],
    latitude: 12.9716,
    longitude: 77.5946,
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    collegeId: null,
    ownerConfirmed: false,
    studentConfirmed: false,
    posted_by: 'user-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
    completedAt: null,
    isPremium: false,
    expires_at: null,
    required_skills: ['Communication', 'Events'],
    views: 10,
    work_mode: 'hybrid',
    poster: { id: 'user-1', name: 'John Doe', image: null, college: 'IISc' }
  },
  {
    id: 'gig-remote-1',
    title: 'Full Stack React Developer',
    description: 'Build Next.js web application completely remote',
    budget: 15000,
    deadline: new Date('2026-12-31'),
    status: 'OPEN',
    tags: ['dev'],
    latitude: null,
    longitude: null,
    city: null,
    state: null,
    country: 'India',
    collegeId: null,
    ownerConfirmed: false,
    studentConfirmed: false,
    posted_by: 'user-2',
    createdAt: new Date('2026-09-02'),
    updatedAt: new Date('2026-09-02'),
    completedAt: null,
    isPremium: false,
    expires_at: null,
    required_skills: ['Next.js', 'TypeScript'],
    views: 25,
    work_mode: 'remote',
    poster: { id: 'user-2', name: 'Jane Smith', image: null, college: 'IIT Bombay' }
  }
]

const mockInternships = [
  {
    id: 'int-blr-1',
    title: 'Frontend Engineering Intern',
    description: 'Frontend intern at Bengaluru tech startup',
    company: 'TechCorp India',
    skills: ['React', 'CSS'],
    stipend: '₹25,000/month',
    duration: '3 months',
    location: 'Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    collegeId: null,
    deadline: new Date('2026-12-31'),
    status: 'ACTIVE',
    isFeatured: true,
    createdAt: new Date('2026-09-03'),
    updatedAt: new Date('2026-09-03'),
    applicationLink: 'https://example.com/apply',
    applyCount: 5,
    tags: ['tech'],
    views: 100,
    externalId: null,
    source: 'INTERNAL'
  },
  {
    id: 'int-hyd-1',
    title: 'Backend Engineering Intern',
    description: 'Backend intern at Hyderabad office',
    company: 'CloudScale',
    skills: ['Node.js', 'PostgreSQL'],
    stipend: '₹30,000/month',
    duration: '6 months',
    location: 'Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.3850,
    longitude: 78.4867,
    collegeId: null,
    deadline: new Date('2026-12-31'),
    status: 'ACTIVE',
    isFeatured: false,
    createdAt: new Date('2026-09-04'),
    updatedAt: new Date('2026-09-04'),
    applicationLink: 'https://example.com/apply-hyd',
    applyCount: 8,
    tags: ['backend'],
    views: 80,
    externalId: null,
    source: 'INTERNAL'
  }
]

vi.mock('@/lib/prisma', () => {
  return {
    default: {
      gig: {
        findMany: vi.fn(async (args?: any) => {
          let list = [...mockGigs]
          if (args?.where?.work_mode?.in) {
            list = list.filter(g => args.where.work_mode.in.includes(g.work_mode))
          }
          return list
        })
      },
      internship: {
        findMany: vi.fn(async () => [...mockInternships])
      }
    }
  }
})

describe('Opportunity Geolocation & Discovery Engine', () => {
  it('should calculate truthful distances and sort nearest-first', async () => {
    // Mock user in Bengaluru: 12.9716, 77.5946
    const userLat = 12.9716
    const userLng = 77.5946

    const result = await getUnifiedOpportunities({
      userLat,
      userLng,
      sortBy: 'distance',
      limit: 50
    })

    expect(result.opportunities).toBeDefined()
    expect(result.opportunities.length).toBeGreaterThan(0)

    // Items with coordinates should have distanceMeters and distanceFormatted
    const itemsWithCoords = result.opportunities.filter(o => o.latitude && o.longitude)
    expect(itemsWithCoords.length).toBeGreaterThan(0)

    itemsWithCoords.forEach(item => {
      expect(item.distanceMeters).toBeDefined()
      expect(typeof item.distanceMeters).toBe('number')
      expect(item.distanceFormatted).toBeDefined()
      expect(typeof item.distanceFormatted).toBe('string')
      expect(item.distanceFormatted).toMatch(/(m|km) away/)
      expect(item.distanceLabel).toBe(item.distanceFormatted)
      if (item.locationType === 'APPROXIMATE_CITY') {
        expect(item.isApproximateDistance).toBe(true)
        expect(item.distanceFormatted).toMatch(/^Approx\./)
      } else {
        expect(item.isApproximateDistance).toBe(false)
      }
    })

    // Verify distance sorting: item[n].distanceMeters <= item[n+1].distanceMeters
    for (let i = 0; i < itemsWithCoords.length - 1; i++) {
      expect(itemsWithCoords[i].distanceMeters!).toBeLessThanOrEqual(itemsWithCoords[i + 1].distanceMeters!)
    }

    // Bengaluru opportunities should be 0 km away, Hyderabad ~500 km away
    const blrItem = itemsWithCoords.find(o => o.location.includes('Bengaluru'))
    const hydItem = itemsWithCoords.find(o => o.location.includes('Hyderabad'))
    expect(blrItem).toBeDefined()
    expect(hydItem).toBeDefined()
    expect(blrItem!.distanceMeters!).toBeLessThan(hydItem!.distanceMeters!)
  })

  it('should filter out opportunities outside the requested radius', async () => {
    // User in Bengaluru: 12.9716, 77.5946, radius 50km
    const userLat = 12.9716
    const userLng = 77.5946
    const radiusKm = 50

    const result = await getUnifiedOpportunities({
      userLat,
      userLng,
      radiusKm,
      sortBy: 'distance',
      limit: 50
    })

    // All returned physical opportunities must be <= 50,000 meters
    result.opportunities.forEach(opp => {
      if (opp.distanceMeters !== undefined) {
        expect(opp.distanceMeters).toBeLessThanOrEqual(50000)
      }
    })

    // Hyderabad (~500km away) must NOT be present within 50km
    const hydItem = result.opportunities.find(o => o.location.includes('Hyderabad'))
    expect(hydItem).toBeUndefined()
  })

  it('should not assign coordinates or fake distance to remote gigs', async () => {
    const result = await getUnifiedOpportunities({
      workMode: 'remote',
      limit: 10
    })

    const remoteGigs = result.opportunities.filter(o => o.locationType === 'REMOTE')
    expect(remoteGigs.length).toBeGreaterThan(0)
    remoteGigs.forEach(gig => {
      expect(gig.distanceMeters).toBeUndefined()
      expect(gig.distanceFormatted).toBeUndefined()
      expect(gig.distanceLabel).toBeUndefined()
    })
  })

  it('should filter opportunities by on-site work mode', async () => {
    const result = await getUnifiedOpportunities({
      workMode: 'on-site',
      limit: 10
    })
    expect(result.opportunities).toBeDefined()
  })
})

