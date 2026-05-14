import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { prisma } from '../db/prisma';

const BCRYPT_ROUNDS = 12;

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, BCRYPT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export interface AccessTokenPayload {
  sub: string; // userId
  phone: string;
}

export function issueAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const raw = crypto.randomBytes(48).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  return raw;
}

export async function rotateRefreshToken(
  raw: string,
): Promise<{ userId: string; newRaw: string } | null> {
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { tokenHash } });
    return null;
  }

  await prisma.refreshToken.delete({ where: { tokenHash } });

  const newRaw = crypto.randomBytes(48).toString('hex');
  const newHash = crypto.createHash('sha256').update(newRaw).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { userId: stored.userId, tokenHash: newHash, expiresAt } });

  return { userId: stored.userId, newRaw };
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}
