import { describe, it, expect } from 'vitest';
import { 
  getActiveOpportunityPrismaFilter, 
  isOpportunityActive, 
  isOpportunityExpired 
} from '@/lib/opportunities/lifecycle';
import { redactSensitiveData } from '@/lib/logger';

describe('Phase 13: Opportunity Lifecycle Authoritative Definition', () => {
  it('should generate the authoritative Prisma filter for active opportunities', () => {
    const filter = getActiveOpportunityPrismaFilter();
    expect(filter.deletedAt).toBeNull();
    expect(filter.OR).toEqual([
      { deadline: null },
      { deadline: { gte: expect.any(Date) } },
    ]);
  });

  it('should accurately determine if an opportunity is active', () => {
    const futureDate = new Date(Date.now() + 86400000);
    const pastDate = new Date(Date.now() - 86400000);

    // Object signature
    expect(isOpportunityActive({ status: 'OPEN', deadline: futureDate, deletedAt: null })).toBe(true);
    expect(isOpportunityActive({ status: 'active', deadline: null, deletedAt: null })).toBe(true);

    // Inactive conditions
    expect(isOpportunityActive({ status: 'CLOSED', deadline: futureDate, deletedAt: null })).toBe(false);
    expect(isOpportunityActive({ status: 'OPEN', deadline: pastDate, deletedAt: null })).toBe(false);
    expect(isOpportunityActive({ status: 'OPEN', deadline: futureDate, deletedAt: new Date() })).toBe(false);

    // Positional signature
    expect(isOpportunityActive('OPEN', futureDate, null)).toBe(true);
    expect(isOpportunityActive('CLOSED', futureDate, null)).toBe(false);
  });

  it('should accurately identify expired opportunities', () => {
    const futureDate = new Date(Date.now() + 86400000);
    const pastDate = new Date(Date.now() - 86400000);

    expect(isOpportunityExpired(pastDate)).toBe(true);
    expect(isOpportunityExpired(pastDate.toISOString())).toBe(true);
    expect(isOpportunityExpired(futureDate)).toBe(false);
    expect(isOpportunityExpired(null)).toBe(false);
    expect(isOpportunityExpired(undefined)).toBe(false);
  });
});

describe('Phase 13: Recursive Logger Redaction & Privacy', () => {
  it('should redact sensitive keys recursively across nested objects and arrays', () => {
    const sensitivePayload = {
      user: {
        id: 'usr-123',
        password: 'super-secret-password',
        auth_token: 'jwt.token.here',
        location: {
          latitude: 12.9716,
          longitude: 77.5946,
          lat: 12.9716,
          lng: 77.5946,
          city: 'Bangalore',
        },
        coordinates: {
          x: 1,
          y: 2,
        },
      },
      headers: {
        authorization: 'Bearer sk_live_secret123',
        cookie: 'session_id=abcdef123456',
        api_key: 'razorpay_secret_key',
      },
      list: [
        { secret: 'very-secret', name: 'Safe Item' },
        'regular string',
      ],
    };

    const redacted = redactSensitiveData(sensitivePayload) as any;

    // Unredacted safe fields
    expect(redacted.user.id).toBe('usr-123');
    expect(redacted.user.location.city).toBe('Bangalore');
    expect(redacted.list[0].name).toBe('Safe Item');
    expect(redacted.list[1]).toBe('regular string');

    // Redacted sensitive keys
    expect(redacted.user.password).toBe('[REDACTED]');
    expect(redacted.user.auth_token).toBe('[REDACTED]');
    expect(redacted.user.location.latitude).toBe('[REDACTED_COORD]');
    expect(redacted.user.location.longitude).toBe('[REDACTED_COORD]');
    expect(redacted.user.location.lat).toBe('[REDACTED_COORD]');
    expect(redacted.user.location.lng).toBe('[REDACTED_COORD]');
    expect(redacted.user.coordinates).toBe('[REDACTED_COORD]');
    expect(redacted.headers.authorization).toBe('[REDACTED]');
    expect(redacted.headers.cookie).toBe('[REDACTED]');
    expect(redacted.headers.api_key).toBe('[REDACTED]');
    expect(redacted.list[0].secret).toBe('[REDACTED]');
  });

  it('should handle primitives and null values safely without crashing', () => {
    expect(redactSensitiveData(null)).toBe(null);
    expect(redactSensitiveData(undefined)).toBe(undefined);
    expect(redactSensitiveData(42)).toBe(42);
    expect(redactSensitiveData('regular string')).toBe('regular string');
  });
});
