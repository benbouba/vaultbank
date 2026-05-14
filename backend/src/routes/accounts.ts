import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/accounts/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const account = await prisma.account.findUnique({
    where: { userId: req.userId },
    include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, kycVerified: true, bvnEncrypted: true, createdAt: true } } },
  });
  if (!account) { res.status(404).json({ error: 'Account not found.' }); return; }

  res.json({
    accountNumber: account.accountNumber,
    balance: account.balance,
    currency: account.currency,
    accountType: account.accountType,
    kycVerified: account.user.kycVerified,
    bvnLinked: !!account.user.bvnEncrypted,
    owner: {
      firstName: account.user.firstName,
      lastName: account.user.lastName,
      email: account.user.email,
      phone: account.user.phone,
      createdAt: account.user.createdAt,
    },
  });
});

export default router;
