import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { generateReference } from '../utils/generate';
import { validate } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const transferSchema = z.object({
  recipientAccountNumber: z.string().length(10),
  recipientBank: z.string().min(1),
  amount: z.number().positive().min(1),
  narration: z.string().max(100).optional(),
});

const airtimeSchema = z.object({
  phone: z.string().regex(/^0[789]\d{9}$/),
  network: z.string().min(1),
  amount: z.number().positive().min(50).max(50000),
});

const billSchema = z.object({
  provider: z.string().min(1),
  plan: z.string().optional(),
  customerId: z.string().min(1), // meter no, card no, etc.
  amount: z.number().positive().min(100),
  type: z.enum(['electricity', 'cable_tv', 'data', 'education']),
});

// GET /api/transactions  — paginated history
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const skip = (page - 1) * limit;

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where: { userId: req.userId } }),
  ]);

  res.json({
    data: transactions.map((t) => ({
      ...t,
      metadata: t.metadata ? JSON.parse(t.metadata) : null,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// POST /api/transactions/transfer
router.post('/transfer', requireAuth, validate(transferSchema), async (req: AuthRequest, res: Response) => {
  const { recipientAccountNumber, recipientBank, amount, narration } = req.body;

  const account = await prisma.account.findUnique({ where: { userId: req.userId } });
  if (!account) { res.status(404).json({ error: 'Account not found.' }); return; }

  if (account.balance < amount) {
    res.status(422).json({ error: 'Insufficient balance.' });
    return;
  }

  const reference = generateReference();

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: req.userId!,
        type: 'transfer',
        amount,
        reference,
        narration: narration ?? `Transfer to ${recipientAccountNumber}`,
        recipient: recipientAccountNumber,
        status: 'success',
        metadata: JSON.stringify({ bank: recipientBank }),
      },
    }),
    prisma.account.update({
      where: { userId: req.userId },
      data: { balance: { decrement: amount } },
    }),
  ]);

  res.status(201).json({ reference: transaction.reference, status: 'success', newBalance: account.balance - amount });
});

// POST /api/transactions/airtime
router.post('/airtime', requireAuth, validate(airtimeSchema), async (req: AuthRequest, res: Response) => {
  const { phone, network, amount } = req.body;

  const account = await prisma.account.findUnique({ where: { userId: req.userId } });
  if (!account || account.balance < amount) {
    res.status(422).json({ error: 'Insufficient balance.' }); return;
  }

  const reference = generateReference();

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: req.userId!,
        type: 'airtime',
        amount,
        reference,
        narration: `${network} airtime – ${phone}`,
        recipient: phone,
        status: 'success',
        metadata: JSON.stringify({ network }),
      },
    }),
    prisma.account.update({ where: { userId: req.userId }, data: { balance: { decrement: amount } } }),
  ]);

  res.status(201).json({ reference, status: 'success', newBalance: account.balance - amount });
});

// POST /api/transactions/bill
router.post('/bill', requireAuth, validate(billSchema), async (req: AuthRequest, res: Response) => {
  const { provider, plan, customerId, amount, type } = req.body;

  const account = await prisma.account.findUnique({ where: { userId: req.userId } });
  if (!account || account.balance < amount) {
    res.status(422).json({ error: 'Insufficient balance.' }); return;
  }

  const reference = generateReference();

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: req.userId!,
        type,
        amount,
        reference,
        narration: `${provider}${plan ? ' – ' + plan : ''} (${customerId})`,
        recipient: customerId,
        status: 'success',
        metadata: JSON.stringify({ provider, plan }),
      },
    }),
    prisma.account.update({ where: { userId: req.userId }, data: { balance: { decrement: amount } } }),
  ]);

  res.status(201).json({ reference, status: 'success', newBalance: account.balance - amount });
});

export default router;
