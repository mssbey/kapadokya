// Vercel's serverless bundler for this entrypoint doesn't reliably include
// dotenv in the deployed function, and it's only needed for local `.env`
// loading anyway — Vercel (and Render) inject env vars directly.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
} catch {
  // Not available in this runtime; process.env is already populated.
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { authRouter } from './routes/auth';
import { tourRouter } from './routes/tours';
import { bookingRouter } from './routes/bookings';
import { paymentRouter } from './routes/payments';
import { availabilityRouter } from './routes/availability';
import { legalRouter } from './routes/legal';
import { faqRouter } from './routes/faqs';
import { partnerRouter } from './routes/partners';
import { testimonialRouter } from './routes/testimonials';
import { adminRouter } from './routes/admin';
import { adminMediaRouter } from './routes/adminMedia';
import { errorHandler } from './middleware/errorHandler';
import { setupWebSocket } from './websocket';
import { prisma } from './lib/prisma';
import { csrfProtection } from './lib/session';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Security
app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stripe signature verification requires the exact raw request body.
app.use('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', csrfProtection);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/tours', tourRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/legal', legalRouter);
app.use('/api/faqs', faqRouter);
app.use('/api/partners', partnerRouter);
app.use('/api/testimonials', testimonialRouter);
app.use('/api/admin', adminMediaRouter);
app.use('/api/admin', adminRouter);

// Error handler
app.use(errorHandler);

// WebSocket
setupWebSocket(wss);

const PORT = process.env.PORT || 5000;

// Always a long-lived process (Docker container, Render, or local dev) —
// never a Vercel serverless function — so it always binds a real TCP port.
server.listen(PORT, () => {
  console.log(`Discovery Cappadocia API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

export { app, server, wss };
export default app;
