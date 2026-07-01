import dotenv from 'dotenv';
dotenv.config();

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
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';
import { setupWebSocket } from './websocket';
import { prisma } from './lib/prisma';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
app.use('/api/admin', adminRouter);

// Error handler
app.use(errorHandler);

// WebSocket
setupWebSocket(wss);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Discovery Cappadocia API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

export { app, server, wss };
