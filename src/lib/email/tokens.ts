import crypto from 'crypto';

const TOKEN_EXPIRATION_HOURS = 24 * 30; // 30 days per CAN-SPAM opt-out validity guidelines

interface UnsubscribePayload {
  uid: string;
  exp: number;
}

export function isUnsubscribeSecretValid(): { valid: boolean; error?: string } {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || process.env.UNSUBSCRIBE_SIGNING_SECRET;
  if (!secret) {
    return { valid: false, error: 'UNSUBSCRIBE_TOKEN_SECRET is missing.' };
  }

  const trimmed = secret.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.includes('placeholder') ||
    lower.includes('secret-key') ||
    lower.includes('default') ||
    lower.includes('todo') ||
    lower.includes('changeme') ||
    lower.includes('example') ||
    lower === 'secret'
  ) {
    return { valid: false, error: 'UNSUBSCRIBE_TOKEN_SECRET cannot be a placeholder or default value.' };
  }

  if (trimmed.length < 32) {
    return { valid: false, error: 'UNSUBSCRIBE_TOKEN_SECRET must be at least 32 characters.' };
  }

  return { valid: true };
}

function getSecret(): string {
  const validation = isUnsubscribeSecretValid();
  if (!validation.valid) {
    throw new Error(`Unsubscribe security failure: ${validation.error}`);
  }
  return (process.env.UNSUBSCRIBE_TOKEN_SECRET || process.env.UNSUBSCRIBE_SIGNING_SECRET)!.trim();
}

/**
 * Creates a tamper-resistant, expiring HMAC-SHA256 signed token for unsubscribe URLs.
 * Keeps user email address out of URLs and access logs.
 */
export function createUnsubscribeToken(userId: string, expiresInHours = TOKEN_EXPIRATION_HOURS): string {
  const exp = Math.floor(Date.now() / 1000) + (expiresInHours * 3600);
  const payload: UnsubscribePayload = { uid: userId, exp };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', getSecret());
  hmac.update(payloadStr);
  const signature = hmac.digest('base64url');
  
  return `${payloadStr}.${signature}`;
}

/**
 * Verifies the integrity, signature, and expiration of an unsubscribe token.
 */
export function verifyUnsubscribeToken(token: string): { valid: boolean; userId?: string; error?: string } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Missing token' };
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const [payloadStr, providedSignature] = parts;
    
    // Verify HMAC
    const hmac = crypto.createHmac('sha256', getSecret());
    hmac.update(payloadStr);
    const expectedSignature = hmac.digest('base64url');

    // Constant-time comparison to prevent timing attacks
    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return { valid: false, error: 'Invalid token signature' };
    }

    // Decode payload
    const decodedJson = Buffer.from(payloadStr, 'base64url').toString('utf8');
    const payload: UnsubscribePayload = JSON.parse(decodedJson);

    // Verify expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    if (!payload.uid) {
      return { valid: false, error: 'Missing user identifier in token' };
    }

    return { valid: true, userId: payload.uid };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify token';
    return { valid: false, error: message };
  }
}
