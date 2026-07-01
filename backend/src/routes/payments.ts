import { Router } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const paymentRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

const createPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  provider: z.enum(['STRIPE', 'IYZICO']),
});

// Create Stripe payment intent
paymentRouter.post('/create-intent', async (req, res, next) => {
  try {
    const data = createPaymentSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { payment: true, tour: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.payment?.status === 'COMPLETED') {
      throw new AppError('Payment already completed', 400);
    }

    if (data.provider === 'STRIPE') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalPrice * 100),
        currency: booking.currency.toLowerCase(),
        metadata: {
          bookingId: booking.id,
          tourTitle: booking.tour.title,
        },
      });

      // Create or update payment record
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
          providerPaymentId: paymentIntent.id,
          status: 'PENDING',
        },
      });

      return res.json({
        success: true,
        data: { clientSecret: paymentIntent.client_secret },
      });
    }

    if (data.provider === 'IYZICO') {
      // iyzico integration
      const iyzicoPayment = await createIyzicoPayment(booking);

      await prisma.payment.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          currency: 'TRY',
          provider: 'IYZICO',
          providerPaymentId: iyzicoPayment.token,
        },
        update: {
          providerPaymentId: iyzicoPayment.token,
          status: 'PENDING',
        },
      });

      return res.json({
        success: true,
        data: { checkoutFormContent: iyzicoPayment.checkoutFormContent },
      });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(err.errors[0].message, 400));
    }
    next(err);
  }
});

// Stripe webhook
paymentRouter.post('/webhook/stripe', async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new AppError('Webhook secret not configured', 500);
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch {
      throw new AppError('Invalid webhook signature', 400);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await prisma.payment.updateMany({
        where: { providerPaymentId: paymentIntent.id },
        data: { status: 'COMPLETED' },
      });

      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId: paymentIntent.id },
      });

      if (payment) {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' },
        });
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await prisma.payment.updateMany({
        where: { providerPaymentId: paymentIntent.id },
        data: { status: 'FAILED' },
      });
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

// iyzico callback
paymentRouter.post('/webhook/iyzico', async (req, res, next) => {
  try {
    const { token, status } = req.body;

    if (status === 'success') {
      await prisma.payment.updateMany({
        where: { providerPaymentId: token },
        data: { status: 'COMPLETED' },
      });

      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId: token },
      });

      if (payment) {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' },
        });
      }
    } else {
      await prisma.payment.updateMany({
        where: { providerPaymentId: token },
        data: { status: 'FAILED' },
      });
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

// Helper: iyzico payment creation
async function createIyzicoPayment(booking: any) {
  const Iyzipay = require('iyzipay');

  const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  });

  return new Promise<any>((resolve, reject) => {
    const request = {
      locale: 'tr',
      conversationId: booking.id,
      price: booking.totalPrice.toString(),
      paidPrice: booking.totalPrice.toString(),
      currency: 'TRY',
      basketId: booking.id,
      paymentGroup: 'PRODUCT',
      callbackUrl: `${process.env.BACKEND_URL}/api/payments/webhook/iyzico`,
      buyer: {
        id: booking.userId || 'guest',
        name: booking.guestName?.split(' ')[0] || 'Guest',
        surname: booking.guestName?.split(' ').slice(1).join(' ') || 'User',
        email: booking.guestEmail,
        identityNumber: '00000000000',
        registrationAddress: 'Cappadocia, Turkey',
        city: 'Nevsehir',
        country: 'Turkey',
        ip: '127.0.0.1',
      },
      basketItems: [
        {
          id: booking.tourId,
          name: booking.tour?.title || 'Tour',
          category1: 'Travel',
          itemType: 'VIRTUAL',
          price: booking.totalPrice.toString(),
        },
      ],
    };

    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}
