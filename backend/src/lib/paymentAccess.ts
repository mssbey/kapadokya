import crypto from 'crypto';

const TOKEN_BYTES = 32;

export function createPaymentAccessToken() {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
  return {
    token,
    hash: hashPaymentAccessToken(token),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  };
}

export function hashPaymentAccessToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function paymentAccessTokenMatches(token: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashPaymentAccessToken(token), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function createBookingNumber(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `DC-${date}-${suffix}`;
}

