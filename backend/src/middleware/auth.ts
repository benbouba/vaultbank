import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/authService';

export interface AuthRequest extends Request {
  userId?: string;
  userPhone?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header.' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userPhone = payload.phone;
    next();
  } catch {
    res.status(401).json({ error: 'Access token is expired or invalid.' });
  }
}
