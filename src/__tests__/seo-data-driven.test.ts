import { describe, it, expect } from 'vitest';
import { getDistanceBand, resolveLocationContext } from '@/lib/geo/distance';

describe('Data-Driven Location & Distance Bands (Phase 12)', () => {
  it('should categorize distances in meters into correct distance bands', () => {
    expect(getDistanceBand(2500)).toBe('0-5km');
    expect(getDistanceBand(5000)).toBe('0-5km');
    expect(getDistanceBand(7200)).toBe('5-10km');
    expect(getDistanceBand(10000)).toBe('5-10km');
    expect(getDistanceBand(18000)).toBe('10-25km');
    expect(getDistanceBand(25000)).toBe('10-25km');
    expect(getDistanceBand(45000)).toBe('25-50km');
    expect(getDistanceBand(50000)).toBe('25-50km');
    expect(getDistanceBand(80000)).toBe('50-100km');
    expect(getDistanceBand(120000)).toBe('100+km');
    expect(getDistanceBand(null)).toBeNull();
    expect(getDistanceBand(-10)).toBeNull();
  });

  it('should generate truthful location context without false claims', () => {
    // 1. Remote
    const remote = resolveLocationContext({ workMode: 'remote', city: 'Hyderabad', distanceMeters: 25000 });
    expect(remote.isRemote).toBe(true);
    expect(remote.badge).toBe('Remote — No commute required');

    // 2. Local exact distance
    const local = resolveLocationContext({ workMode: 'on-site', city: 'Hyderabad', distanceMeters: 3200, isApproximateDistance: false });
    expect(local.badge).toBe('3.2 km away (Hyderabad)');
    expect(local.isApproximate).toBe(false);

    // 3. Approximate distance with city
    const approx = resolveLocationContext({ workMode: 'on-site', city: 'Bengaluru', distanceMeters: 8500, isApproximateDistance: true });
    expect(approx.badge).toBe('Approx. 8.5 km away (Bengaluru)');
    expect(approx.isApproximate).toBe(true);

    // 4. College proximity
    const nearCollege = resolveLocationContext({ workMode: 'on-site', city: 'Surampalem', distanceMeters: 2000, isNearCollege: true, collegeName: 'Aditya College' });
    expect(nearCollege.badge).toBe('Near Aditya College');

    // 5. City only when no distance is known
    const cityOnly = resolveLocationContext({ workMode: 'hybrid', city: 'Hyderabad' });
    expect(cityOnly.badge).toBe('Hybrid — Hyderabad');

    // 6. Completely unspecified
    const unknown = resolveLocationContext({ workMode: null });
    expect(unknown.badge).toBe('Location unspecified');
  });
});
