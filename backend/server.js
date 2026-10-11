import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { connectDB } from './config/db.js'; // DNS pinning + IPv4 handled inside
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { archivePastBookings } from './services/archivalService.js';

dotenv.config();

// Phase 6.1 — fail fast in production when the signing secret is missing
// instead of falling back to a weak default (see authMiddleware).
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('[Security] JWT_SECRET is not set. Refusing to boot in production.');
  process.exit(1);
}

// Fire up MongoDB core link
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Phase 6.1 — hardening headers + transport guards (GIGW S-chapter).
// `trust proxy` lets rate-limiters + HTTPS checks see the real client IP
// when running behind Render / Nginx / Cloudflare.
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(
  helmet({
    // API serves JSON only — tight default CSP, no inline scripts needed.
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'same-site' },
    // HSTS only matters over TLS; helmet sends it always, browsers honour
    // it on HTTPS responses. 1 year + preload for STQC pre-check.
    hsts: isProd
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    referrerPolicy: { policy: 'no-referrer' },
  })
);

// HTTPS redirect in production (platforms terminate TLS and set
// x-forwarded-proto). Local dev stays plain HTTP.
if (isProd) {
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    return next();
  });
}

// Phase 6.1 — locked-down CORS. Same-origin in prod via FRONTEND_URL /
// CORS_ORIGIN (comma-separated allow-list); permissive localhost in dev.
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin / curl / health checks carry no Origin header — allow.
      if (!origin) return callback(null, true);
      if (!isProd) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS origin rejected'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);
app.use(express.json({ limit: '3mb' }));

// Mount production routing matrix
app.use('/api', apiRoutes);

// JSON error handler must be registered after all routes
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`[Server] Live in ${process.env.NODE_ENV} environment configuration running on port ${PORT}`);
});

// Phase 5.5 — nightly archival (GIGW Q8): past Confirmed bookings become
// Archived so live pages never act on outdated slots. No scheduler dep:
// one delayed first run (lets Mongo connect) + every 24h. Idempotent and
// failure-isolated — a DB outage logs instead of crashing the server.
const DAY_MS = 24 * 60 * 60 * 1000;
const runArchival = async () => {
  try {
    const count = await archivePastBookings();
    if (count > 0) console.log(`[Archive] Archived ${count} past booking(s).`);
  } catch (error) {
    console.error('[Archive] Scheduled run failed:', error.message);
  }
};
setTimeout(runArchival, 60 * 1000);
setInterval(runArchival, DAY_MS);

// Fail loudly (and let nodemon exit cleanly) instead of silently hanging on
// "app crashed — waiting for file changes" when the port is already taken
// (e.g. another `node server.js` / AI Fit already bound to 5000).
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[Server] Port ${PORT} is already in use. Stop the other process ` +
        `(or set a different PORT in backend/.env) and retry.`
    );
  } else {
    console.error(`[Server] Failed to start: ${err.message}`);
  }
  process.exit(1);
});