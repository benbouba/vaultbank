import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { hashPin, verifyPin, issueAccessToken, issueRefreshToken, rotateRefreshToken, revokeAllRefreshTokens } from '../services/authService';
import { encrypt } from '../utils/crypto';
import { generateAccountNumber } from '../utils/generate';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^0[789]\d{9}$/, 'Enter a valid Nigerian phone number (e.g. 08012345678)'),
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4–6 digits'),
  bvn: z.string().regex(/^\d{11}$/, 'BVN must be 11 digits').optional(),
});

const loginSchema = z.object({
  phone: z.string(),
  pin: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// POST /api/auth/register
router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, pin, bvn } = req.body;

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existing) {
    const field = existing.email === email ? 'email' : 'phone number';
    res.status(409).json({ error: `An account with this ${field} already exists.` });
    return;
  }

  const pinHash = await hashPin(pin);
  const bvnEncrypted = bvn ? encrypt(bvn) : undefined;
  const accountNumber = generateAccountNumber();

  // Ensure generated account number is unique
  const accExists = await prisma.account.findUnique({ where: { accountNumber } });
  if (accExists) {
    res.status(500).json({ error: 'Account generation conflict. Please try again.' });
    return;
  }

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      pinHash,
      bvnEncrypted,
      kycVerified: !!bvn,
      account: {
        create: {
          accountNumber,
          balance: 250000,
          currency: 'NGN',
          accountType: 'savings',
        },
      },
    },
    include: { account: true },
  });

  const accessToken = issueAccessToken({ sub: user.id, phone: user.phone });
  const refreshToken = await issueRefreshToken(user.id);

  res.status(201).json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      kycVerified: user.kycVerified,
      accountNumber: user.account!.accountNumber,
      balance: user.account!.balance,
      createdAt: user.createdAt,
    },
  });
});

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  const { phone, pin } = req.body;

  const user = await prisma.user.findUnique({
    where: { phone },
    include: { account: true },
  });

  // Use constant-time comparison to prevent user enumeration timing attacks
  const dummyHash = '$2a$12$KJRqmgSjrqKhAcfIVKc7fO1R3LDRmFkWiSkdUh1/Pf8kLzSXkXjRi';
  const pinOk = user ? await verifyPin(pin, user.pinHash) : await verifyPin(pin, dummyHash);

  if (!user || !pinOk) {
    res.status(401).json({ error: 'Invalid phone number or PIN.' });
    return;
  }

  const accessToken = issueAccessToken({ sub: user.id, phone: user.phone });
  const refreshToken = await issueRefreshToken(user.id);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      kycVerified: user.kycVerified,
      accountNumber: user.account?.accountNumber,
      balance: user.account?.balance,
      createdAt: user.createdAt,
    },
  });
});

// POST /api/auth/refresh
router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response) => {
  const result = await rotateRefreshToken(req.body.refreshToken);
  if (!result) {
    res.status(401).json({ error: 'Refresh token is invalid or expired. Please log in again.' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: result.userId } });
  if (!user) {
    res.status(401).json({ error: 'User not found.' });
    return;
  }

  const accessToken = issueAccessToken({ sub: user.id, phone: user.phone });
  res.json({ accessToken, refreshToken: result.newRaw });
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req: AuthRequest, res: Response) => {
  await revokeAllRefreshTokens(req.userId!);
  res.json({ message: 'Logged out successfully.' });
});

export default router;
