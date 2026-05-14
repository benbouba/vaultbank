import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { apiLimiter } from './middleware/rateLimiter';
import routes from './routes';

const app = express();

// ── Security headers ────────────────────────────────────────
app.use(helmet());

// ── CORS — only allow the configured frontend origin ────────
app.use(
  cors({
    origin: config.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// ── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '64kb' }));

// ── HTTP request logging ────────────────────────────────────
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  // Production: structured JSON logs without sensitive fields
  app.use(morgan('tiny'));
}

// ── General rate limiting ───────────────────────────────────
app.use('/api', apiLimiter);

// ── Routes ─────────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv, ts: new Date().toISOString() });
});

// ── 404 handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ── Global error handler ────────────────────────────────────
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ───────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n🏦  VaultBank API running on http://localhost:${config.port}`);
  console.log(`    ENV: ${config.nodeEnv}`);
  console.log(`    BVN: ${config.prembly.apiKey ? 'Prembly (live)' : 'Simulated (dev)'}\n`);
});

export default app;
