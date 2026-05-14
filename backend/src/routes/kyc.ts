import { Router, Response, Request } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { verifyBvn } from '../services/bvnService';
import { encrypt } from '../utils/crypto';
import { validate } from '../middleware/validate';
import { bvnLimiter } from '../middleware/rateLimiter';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const bvnSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, 'BVN must be exactly 11 digits.'),
});

// POST /api/kyc/verify-bvn-pre — pre-registration BVN check (no auth needed)
router.post(
  '/verify-bvn-pre',
  bvnLimiter,
  validate(bvnSchema),
  async (req: Request, res: Response) => {
    const { bvn } = req.body;
    const result = await verifyBvn(bvn);
    if (!result.verified) {
      res.status(422).json({ error: result.error ?? 'BVN verification failed.' });
      return;
    }
    // Return only safe subset — never raw BVN
    res.json({
      verified: true,
      firstName: result.firstName,
      lastName: result.lastName,
      dateOfBirth: result.dateOfBirth,
    });
  },
);

// POST /api/kyc/verify-bvn  (requires auth)
router.post(
  '/verify-bvn',
  requireAuth,
  bvnLimiter,
  validate(bvnSchema),
  async (req: AuthRequest, res: Response) => {
    const { bvn } = req.body;

    // Don't re-verify if already KYC'd
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'User not found.' }); return; }
    if (user.kycVerified) {
      res.status(409).json({ error: 'BVN already verified for this account.' });
      return;
    }

    const result = await verifyBvn(bvn);
    if (!result.verified) {
      res.status(422).json({ error: result.error ?? 'BVN verification failed.' });
      return;
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        bvnEncrypted: encrypt(bvn),
        kycVerified: true,
      },
    });

    res.json({
      verified: true,
      // Return masked BVN only — never the raw value
      bvnMasked: `****${bvn.slice(-3)}`,
      firstName: result.firstName,
      lastName: result.lastName,
      dateOfBirth: result.dateOfBirth,
    });
  },
);

// GET /api/kyc/status  (requires auth)
router.get('/status', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { kycVerified: true, bvnEncrypted: true },
  });
  if (!user) { res.status(404).json({ error: 'User not found.' }); return; }

  res.json({
    kycVerified: user.kycVerified,
    bvnLinked: !!user.bvnEncrypted,
  });
});

export default router;
