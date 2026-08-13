import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth, type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { invalidateCache } from '../lib/redis';
import { broadcastAvailabilityUpdate, broadcastBookingNotification } from '../websocket';
import { createBookingNumber, createPaymentAccessToken } from '../lib/paymentAccess';

export const bookingRouter = Router();

const createBookingSchema = z.object({
  tourId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(50),
  children: z.literal(0).optional().default(0),
  isPrivate: z.boolean().optional().default(false),
  upsells: z.array(z.object({ id: z.string().uuid(), name: z.string(), price: z.number() })).max(30).optional(),
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email().max(255),
  guestPhone: z.string().min(5).max(30),
  hotelName: z.string().trim().min(2).max(160),
  notes: z.string().max(500).optional(),
  promoCode: z.string().trim().toUpperCase().max(40).optional(),
});
bookingRouter.post('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = createBookingSchema.parse(req.body);
    const bookingDate = new Date(`${data.date}T00:00:00.000Z`);
    if (bookingDate < new Date(new Date().toISOString().slice(0, 10))) throw new AppError('Booking date cannot be in the past', 400);

    const tour = await prisma.tour.findFirst({
      where: { id: data.tourId, isActive: true, isBookingEnabled: true, deletedAt: null },
      include: { upsells: true },
    });
    if (!tour) throw new AppError('Tour not found or booking is closed', 404);

    const availability = await prisma.availability.findUnique({
      where: { tourId_date: { tourId: data.tourId, date: bookingDate } },
    });
    if (!availability || availability.isBlocked) throw new AppError('No availability for this date', 400);

    const totalPeople = data.adults + data.children;
    if (totalPeople < tour.minParticipants) throw new AppError(`This tour requires at least ${tour.minParticipants} guests`, 400);
    if (availability.seatsAvailable < totalPeople) throw new AppError(`Only ${availability.seatsAvailable} seats available`, 400);

    const unitPrice = availability.priceOverride ?? tour.discountedPrice ?? tour.basePrice;
    let subtotal = totalPeople * unitPrice;
    if (data.isPrivate) subtotal *= tour.privatePriceMultiplier;

    let selectedUpsells: { id: string; name: string; price: number }[] = [];
    if (data.upsells?.length) {
      const requestedIds = [...new Set(data.upsells.map((item) => item.id))];
      const validUpsells = tour.upsells.filter((item) => item.isActive && requestedIds.includes(item.id));
      if (validUpsells.length !== requestedIds.length) throw new AppError('One or more add-ons are invalid', 400);
      selectedUpsells = validUpsells.map(({ id, name, price }) => ({ id, name, price }));
      subtotal += validUpsells.reduce((sum, item) => sum + item.price, 0) * totalPeople;
    }
    subtotal = Math.round(subtotal * 100) / 100;

    const promo = data.promoCode
      ? await prisma.promoCode.findUnique({ where: { code: data.promoCode }, include: { tours: { select: { id: true } } } })
      : null;
    let discountAmount = 0;
    if (data.promoCode) {
      const now = new Date();
      if (!promo) throw new AppError('Promo code is invalid or expired', 400);
      const invalid =
        !promo.isActive ||
        (promo.startsAt && promo.startsAt > now) ||
        (promo.endsAt && promo.endsAt < now) ||
        (promo.maxUses !== null && promo.usedCount >= promo.maxUses) ||
        (promo.minCartTotal !== null && subtotal < promo.minCartTotal) ||
        (promo.currency && promo.currency !== tour.currency) ||
        (promo.tours.length > 0 && !promo.tours.some((item) => item.id === tour.id));
      if (invalid) throw new AppError('Promo code is invalid or not applicable to this booking', 400);
      discountAmount = promo.type === 'PERCENT' ? subtotal * (promo.value / 100) : Math.min(subtotal, promo.value);
    }
    discountAmount = Math.round(discountAmount * 100) / 100;
    const totalPrice = Math.round((subtotal - discountAmount) * 100) / 100;
    const paymentAccess = createPaymentAccessToken();

    const booking = await prisma.$transaction(async (tx) => {
      const reservation = await tx.availability.updateMany({
        where: { tourId: data.tourId, date: bookingDate, isBlocked: false, seatsAvailable: { gte: totalPeople } },
        data: { seatsAvailable: { decrement: totalPeople } },
      });
      if (reservation.count !== 1) throw new AppError('Seats no longer available', 409);

      if (promo) {
        const claimed = await tx.promoCode.updateMany({
          where: {
            id: promo.id,
            isActive: true,
            OR: [{ maxUses: null }, { usedCount: { lt: promo.maxUses ?? Number.MAX_SAFE_INTEGER } }],
          },
          data: { usedCount: { increment: 1 } },
        });
        if (claimed.count !== 1) throw new AppError('Promo code has reached its usage limit', 409);
      }

      const created = await tx.booking.create({
        data: {
          bookingNumber: createBookingNumber(),
          userId: req.user?.id || null,
          tourId: data.tourId,
          date: bookingDate,
          adults: data.adults,
          children: data.children,
          isPrivate: data.isPrivate,
          upsells: selectedUpsells.length ? JSON.parse(JSON.stringify(selectedUpsells)) : undefined,
          subtotal,
          discountAmount,
          totalPrice,
          currency: tour.currency,
          promoCodeId: promo?.id,
          promoClaimedAt: promo ? new Date() : null,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          hotelName: data.hotelName,
          notes: data.notes,
          paymentAccessTokenHash: paymentAccess.hash,
          paymentAccessExpiresAt: paymentAccess.expiresAt,
          statusHistory: { create: { toStatus: 'PENDING', note: 'Booking created' } },
        },
        include: { tour: { select: { title: true, slug: true } } },
      });
      return created;
    });

    await invalidateCache('tours:*');
    await invalidateCache(`tour:*:${tour.id}`);
    await invalidateCache(`availability:${data.tourId}:*`);

    const updatedAvailability = await prisma.availability.findUnique({
      where: { tourId_date: { tourId: data.tourId, date: bookingDate } },
    });
    if (updatedAvailability) broadcastAvailabilityUpdate(data.tourId, data.date, updatedAvailability.seatsAvailable);
    broadcastBookingNotification({ tourTitle: tour.title, guestName: data.guestName, date: data.date });

    res.status(201).json({
      success: true,
      data: {
        booking,
        pricing: { subtotal, discountAmount, totalPrice, currency: tour.currency },
        paymentAccessToken: paymentAccess.token,
        paymentAccessExpiresAt: paymentAccess.expiresAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

bookingRouter.get('/my', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.id },
      include: {
        tour: { select: { title: true, slug: true, images: true, category: true, media: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }], take: 1 } } },
        payment: { select: { status: true, provider: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
});

bookingRouter.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id: req.params.id }, { bookingNumber: req.params.id }] },
      include: { tour: true, payment: true, promoCode: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
    });
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') throw new AppError('Not authorized', 403);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});
