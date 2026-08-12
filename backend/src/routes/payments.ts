import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { optionalAuth, type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { paymentAccessTokenMatches } from '../lib/paymentAccess';
import { transitionBookingStatus } from '../services/bookingStatus';
import { invalidateCache } from '../lib/redis';

export const paymentRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' as any });

const createPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  provider: z.enum(['STRIPE', 'IYZICO']),
  paymentAccessToken: z.string().min(20).max(200).optional(),
});

function assertPaymentAccess(booking: any, req: AuthRequest, token?: string) {
  if (req.user && (req.user.role === 'ADMIN' || booking.userId === req.user.id)) return;
  if (
    token &&
    booking.paymentAccessTokenHash &&
    booking.paymentAccessExpiresAt &&
    booking.paymentAccessExpiresAt > new Date() &&
    paymentAccessTokenMatches(token, booking.paymentAccessTokenHash)
  ) return;
  throw new AppError('You are not authorized to pay for this booking', 403);
}

paymentRouter.post('/create-intent', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = createPaymentSchema.parse(req.body);
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { payment: true, tour: true },
    });
    if (!booking) throw new AppError('Booking not found', 404);
    assertPaymentAccess(booking, req, data.paymentAccessToken);
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') throw new AppError('This booking cannot be paid', 409);
    if (booking.payment?.status === 'COMPLETED') throw new AppError('Payment already completed', 409);

    if (booking.payment) {
      if (booking.payment.provider !== data.provider) throw new AppError('An active payment exists with another provider', 409);
      if (booking.payment.status === 'PENDING' && booking.payment.providerPaymentId) {
        if (data.provider === 'STRIPE') {
          const existingIntent = await stripe.paymentIntents.retrieve(booking.payment.providerPaymentId);
          return res.json({ success: true, data: { clientSecret: existingIntent.client_secret, reused: true } });
        }
        throw new AppError('An iyzico payment session is already active for this booking', 409);
      }
    }

    if (data.provider === 'STRIPE') {
      if (!process.env.STRIPE_SECRET_KEY) throw new AppError('Stripe is not configured', 503);
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(booking.totalPrice * 100),
          currency: booking.currency.toLowerCase(),
          metadata: { bookingId: booking.id, bookingNumber: booking.bookingNumber, tourTitle: booking.tour.title },
        },
        { idempotencyKey: `booking:${booking.id}:stripe:v1` },
      );
      await prisma.payment.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          currency: booking.currency,
          provider: 'STRIPE',
          providerPaymentId: paymentIntent.id,
        },
        update: {
          amount: booking.totalPrice,
          currency: booking.currency,
          provider: 'STRIPE',
          providerPaymentId: paymentIntent.id,
          status: 'PENDING',
          failureMessage: null,
        },
      });
      return res.json({ success: true, data: { clientSecret: paymentIntent.client_secret } });
    }

    const iyzicoPayment = await createIyzicoPayment(booking);
    if (iyzicoPayment.status !== 'success' || !iyzicoPayment.token || !iyzicoPayment.checkoutFormContent) {
      throw new AppError(iyzicoPayment.errorMessage || 'iyzico could not create the checkout session', 502);
    }
    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: booking.currency,
        provider: 'IYZICO',
        providerPaymentId: iyzicoPayment.token,
      },
      update: {
        amount: booking.totalPrice,
        currency: booking.currency,
        provider: 'IYZICO',
        providerPaymentId: iyzicoPayment.token,
        status: 'PENDING',
        failureMessage: null,
      },
    });
    return res.json({ success: true, data: { checkoutFormContent: iyzicoPayment.checkoutFormContent } });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

function payloadHash(payload: Buffer | string): string {
  return crypto.createHash('sha256').update(payload).digest('hex');
}

paymentRouter.post('/webhook/stripe', async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new AppError('Webhook secret not configured', 500);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw new AppError('Invalid webhook signature', 400);
    }

    try {
      await prisma.paymentWebhookEvent.create({
        data: { provider: 'STRIPE', eventId: event.id, payloadHash: payloadHash(req.body as Buffer) },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') return res.json({ received: true, duplicate: true });
      throw error;
    }

    let providerPaymentId: string | null = null;
    let targetStatus: 'COMPLETED' | 'FAILED' | 'REFUNDED' | null = null;
    let failureMessage: string | null = null;
    if (event.type === 'payment_intent.succeeded') {
      providerPaymentId = (event.data.object as Stripe.PaymentIntent).id;
      targetStatus = 'COMPLETED';
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      providerPaymentId = intent.id;
      targetStatus = 'FAILED';
      failureMessage = intent.last_payment_error?.message || 'Stripe payment failed';
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      providerPaymentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id || null;
      targetStatus = 'REFUNDED';
    }

    if (providerPaymentId && targetStatus) {
      await applyVerifiedPaymentResult('STRIPE', providerPaymentId, targetStatus, failureMessage, event.id);
    } else {
      await prisma.paymentWebhookEvent.update({
        where: { provider_eventId: { provider: 'STRIPE', eventId: event.id } },
        data: { status: 'IGNORED', processedAt: new Date() },
      });
    }
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

paymentRouter.post('/webhook/iyzico', async (req, res, next) => {
  try {
    const token = z.string().min(1).parse(req.body.token);
    const payment = await prisma.payment.findFirst({ where: { provider: 'IYZICO', providerPaymentId: token } });
    if (!payment) throw new AppError('Payment record not found', 404);
    const verification = await retrieveIyzicoPayment(token, payment.bookingId);
    const verified = verification.status === 'success' && verification.paymentStatus === 'SUCCESS';
    const eventId = String(verification.paymentId || `token:${token}`);

    try {
      await prisma.paymentWebhookEvent.create({
        data: { provider: 'IYZICO', eventId, payloadHash: payloadHash(JSON.stringify(verification)) },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') return res.json({ received: true, duplicate: true });
      throw error;
    }

    if (verification.basketId !== payment.bookingId || Number(verification.paidPrice) !== payment.amount || verification.currency !== payment.currency) {
      await prisma.paymentWebhookEvent.update({
        where: { provider_eventId: { provider: 'IYZICO', eventId } },
        data: { status: 'REJECTED', processedAt: new Date() },
      });
      throw new AppError('iyzico callback verification did not match the booking', 400);
    }

    await applyVerifiedPaymentResult(
      'IYZICO',
      token,
      verified ? 'COMPLETED' : 'FAILED',
      verified ? null : verification.errorMessage || 'iyzico payment failed',
      eventId,
    );
    res.json({ received: true });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError('Invalid iyzico callback', 400));
    next(error);
  }
});

async function applyVerifiedPaymentResult(
  provider: 'STRIPE' | 'IYZICO',
  providerPaymentId: string,
  status: 'COMPLETED' | 'FAILED' | 'REFUNDED',
  failureMessage: string | null,
  eventId: string,
) {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({ where: { provider, providerPaymentId } });
    if (!payment) throw new AppError('Payment record not found', 404);

    if (status === 'COMPLETED' && payment.status !== 'COMPLETED') {
      await tx.payment.update({ where: { id: payment.id }, data: { status, failureMessage: null, processedAt: new Date() } });
      const booking = await tx.booking.findUnique({ where: { id: payment.bookingId } });
      if (booking && booking.status === 'PENDING') {
        await transitionBookingStatus(tx, booking.id, 'CONFIRMED', { note: `${provider} payment completed` });
      }
    } else if (status === 'FAILED' && payment.status !== 'COMPLETED') {
      await tx.payment.update({ where: { id: payment.id }, data: { status, failureMessage, processedAt: new Date() } });
    } else if (status === 'REFUNDED' && payment.status !== 'REFUNDED') {
      await tx.payment.update({ where: { id: payment.id }, data: { status, processedAt: new Date() } });
      const booking = await tx.booking.findUnique({ where: { id: payment.bookingId } });
      if (booking && booking.status !== 'CANCELLED') {
        await transitionBookingStatus(tx, booking.id, 'CANCELLED', { note: `${provider} payment refunded` });
      }
    }

    await tx.paymentWebhookEvent.update({
      where: { provider_eventId: { provider, eventId } },
      data: { paymentId: payment.id, status: 'PROCESSED', processedAt: new Date() },
    });
  });
  const payment = await prisma.payment.findFirst({ where: { provider, providerPaymentId }, select: { booking: { select: { tourId: true } } } });
  if (payment) await invalidateCache(`availability:${payment.booking.tourId}:*`);
}

function iyzicoClient() {
  if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY || !process.env.BACKEND_URL) {
    throw new AppError('iyzico is not configured', 503);
  }
  const Iyzipay = require('iyzipay');
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  });
}

async function createIyzicoPayment(booking: any) {
  const supported = ['TRY', 'EUR', 'USD', 'GBP'];
  if (!supported.includes(booking.currency)) throw new AppError(`iyzico does not support ${booking.currency}`, 400);
  const iyzipay = iyzicoClient();
  const request = {
    locale: 'tr',
    conversationId: booking.id,
    price: booking.totalPrice.toFixed(2),
    paidPrice: booking.totalPrice.toFixed(2),
    currency: booking.currency,
    basketId: booking.id,
    paymentGroup: 'PRODUCT',
    callbackUrl: `${process.env.BACKEND_URL!.replace(/\/$/, '')}/api/payments/webhook/iyzico`,
    buyer: {
      id: booking.userId || booking.id,
      name: booking.guestName?.split(' ')[0] || 'Guest',
      surname: booking.guestName?.split(' ').slice(1).join(' ') || 'User',
      email: booking.guestEmail,
      identityNumber: process.env.IYZICO_DEFAULT_IDENTITY_NUMBER || '11111111111',
      registrationAddress: process.env.IYZICO_DEFAULT_ADDRESS || 'Cappadocia, Turkey',
      city: 'Nevsehir',
      country: 'Turkey',
      ip: '127.0.0.1',
    },
    basketItems: [{ id: booking.tourId, name: booking.tour.title, category1: 'Travel', itemType: 'VIRTUAL', price: booking.totalPrice.toFixed(2) }],
  };
  return new Promise<any>((resolve, reject) => iyzipay.checkoutFormInitialize.create(request, (error: any, result: any) => error ? reject(error) : resolve(result)));
}

async function retrieveIyzicoPayment(token: string, bookingId: string) {
  const iyzipay = iyzicoClient();
  return new Promise<any>((resolve, reject) =>
    iyzipay.checkoutForm.retrieve({ locale: 'tr', conversationId: bookingId, token }, (error: any, result: any) => error ? reject(error) : resolve(result)),
  );
}
