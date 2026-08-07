import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { invalidateCache } from '../lib/redis';
import { broadcastAvailabilityUpdate, broadcastBookingNotification } from '../websocket';

export const bookingRouter = Router();

const createBookingSchema = z.object({
  tourId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(50),
  isPrivate: z.boolean().optional().default(false),
  upsells: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    price: z.number(),
  })).optional(),
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(5).max(20),
  notes: z.string().max(500).optional(),
  promoCode: z.string().trim().toUpperCase().max(40).optional(),
});

// Create booking
bookingRouter.post('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = createBookingSchema.parse(req.body);

    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { id: data.tourId },
      include: { upsells: true },
    });

    if (!tour || !tour.isActive) {
      throw new AppError('Tour not found or not available', 404);
    }

    // Check availability
    const bookingDate = new Date(data.date);
    const availability = await prisma.availability.findUnique({
      where: {
        tourId_date: {
          tourId: data.tourId,
          date: bookingDate,
        },
      },
    });

    if (!availability || availability.isBlocked) {
      throw new AppError('No availability for this date', 400);
    }

    const totalPeople = data.adults + data.children;
    if (availability.seatsAvailable < totalPeople) {
      throw new AppError(`Only ${availability.seatsAvailable} seats available`, 400);
    }

    // Calculate price from server-owned records only.
    const unitPrice = availability.priceOverride || tour.basePrice;
    const childDiscount = 0.5;
    let totalPrice = (data.adults * unitPrice) + (data.children * unitPrice * childDiscount);

    if (data.isPrivate) {
      totalPrice *= 1.5;
    }

    // Add upsells
    let selectedUpsells: { id: string; name: string; price: number }[] = [];
    if (data.upsells && data.upsells.length > 0) {
      const requestedIds = data.upsells.map((item) => item.id);
      const validUpsells = tour.upsells.filter((item) => item.isActive && requestedIds.includes(item.id));
      if (validUpsells.length !== requestedIds.length) throw new AppError('One or more add-ons are invalid', 400);
      selectedUpsells = validUpsells.map(({ id, name, price }) => ({ id, name, price }));
      const upsellTotal = validUpsells.reduce((sum, item) => sum + item.price, 0);
      totalPrice += upsellTotal * totalPeople;
    }

    let promo: Awaited<ReturnType<typeof prisma.promoCode.findUnique>> = null;
    if (data.promoCode) {
      promo = await prisma.promoCode.findUnique({ where: { code: data.promoCode } });
      const now = new Date();
      if (!promo) throw new AppError('Promo code is invalid or expired', 400);
      const invalid = !promo.isActive || (promo.startsAt && promo.startsAt > now) || (promo.endsAt && promo.endsAt < now) || (promo.maxUses !== null && promo.usedCount >= promo.maxUses);
      if (invalid) throw new AppError('Promo code is invalid or expired', 400);
      totalPrice = promo.type === 'PERCENT' ? totalPrice * (1 - promo.value / 100) : Math.max(0, totalPrice - promo.value);
    }

    totalPrice = Math.round(totalPrice * 100) / 100;

    // Create booking + update availability in transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Reserve seats atomically to prevent concurrent overselling.
      const reservation = await tx.availability.updateMany({
        where: { tourId: data.tourId, date: bookingDate, isBlocked: false, seatsAvailable: { gte: totalPeople } },
        data: { seatsAvailable: { decrement: totalPeople } },
      });
      if (reservation.count !== 1) {
        throw new AppError('Seats no longer available', 409);
      }

      if (promo) {
        const claimed = await tx.promoCode.updateMany({
          where: { id: promo.id, isActive: true, OR: [{ maxUses: null }, { usedCount: { lt: promo.maxUses ?? Number.MAX_SAFE_INTEGER } }] },
          data: { usedCount: { increment: 1 } },
        });
        if (claimed.count !== 1) throw new AppError('Promo code has reached its usage limit', 409);
      }

      // Create booking
      const createdBooking = await tx.booking.create({
        data: {
          userId: req.user?.id || null,
          tourId: data.tourId,
          date: bookingDate,
          adults: data.adults,
          children: data.children,
          isPrivate: data.isPrivate,
          upsells: selectedUpsells.length ? JSON.parse(JSON.stringify(selectedUpsells)) : undefined,
          totalPrice,
          currency: tour.currency,
          promoCodeId: promo?.id,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          notes: data.notes,
        },
        include: {
          tour: { select: { title: true, slug: true } },
        },
      });
      return createdBooking;
    });

    // Invalidate cache
    await invalidateCache('tours:*');
    await invalidateCache(`tour:${tour.slug}`);
    await invalidateCache(`availability:${data.tourId}:*`);

    // Broadcast updates
    const updatedAvailability = await prisma.availability.findUnique({
      where: { tourId_date: { tourId: data.tourId, date: bookingDate } },
    });

    if (updatedAvailability) {
      broadcastAvailabilityUpdate(data.tourId, data.date, updatedAvailability.seatsAvailable);
    }

    broadcastBookingNotification({
      tourTitle: tour.title,
      guestName: data.guestName,
      date: data.date,
    });

    res.status(201).json({
      success: true,
      data: {
        booking,
        totalPrice,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(err.errors[0].message, 400));
    }
    next(err);
  }
});

// Get user's bookings
bookingRouter.get('/my', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.id },
      include: {
        tour: { select: { title: true, slug: true, images: true, category: true } },
        payment: { select: { status: true, provider: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
});

// Get booking by ID
bookingRouter.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        tour: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});
