import rateLimit from 'express-rate-limit';

/** Strict limiter for auth endpoints — prevents brute-force PIN attacks */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait 15 minutes before trying again.' },
  skipSuccessfulRequests: true, // only count failed requests
});

/** General API limiter */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

/** Strict limiter for BVN verification — 5 attempts per hour */
export const bvnLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many BVN verification attempts. Try again in 1 hour.' },
});
