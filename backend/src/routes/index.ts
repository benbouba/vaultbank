import { Router } from 'express';
import authRoutes from './auth';
import kycRoutes from './kyc';
import accountRoutes from './accounts';
import transactionRoutes from './transactions';

const router = Router();

router.use('/auth', authRoutes);
router.use('/kyc', kycRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);

export default router;
