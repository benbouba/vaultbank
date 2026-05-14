import crypto from 'crypto';

export function generateAccountNumber(): string {
  // Nigerian 10-digit NUBAN format — starts with a non-zero digit
  const prefix = String(Math.floor(Math.random() * 9) + 1);
  const rest = String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, '0');
  return prefix + rest;
}

export function generateReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `VB-${timestamp}-${random}`;
}
