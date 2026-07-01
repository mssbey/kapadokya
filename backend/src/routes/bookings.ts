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

    // Calculate price
    const unitPrice = availability.priceOverride || tour.basePrice;
    const childDiscount = 0.5;
    let totalPrice = (data.adults * unitPrice) + (data.children * unitPrice * childDiscount);

    if (data.isPrivate) {
      totalPrice *= 1.5;
    }

    // Add upsells
    if (data.upsells && data.upsells.length > 0) {
      const upsellTotal = data.upsells.reduce((sum, u) => sum + u.price, 0);
      totalPrice += upsellTotal * totalPeople;
    }

    totalPrice = Math.round(totalPrice * 100) / 100;

    // Create booking + update availability in transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Recheck availability inside transaction
      const freshAvail = await tx.availability.findUnique({
        where: {
          tourId_date: {
            tourId: data.tourId,
            date: bookingDate,
          },
        },
      });

      if (!freshAvail || freshAvail.seatsAvailable < totalPeople) {
        throw new AppError('Seats no longer available', 409);
      }

      // Update seats
      await tx.availability.update({
        where: { id: freshAvail.id },
        data: { seatsAvailable: freshAvail.seatsAvailable - totalPeople },
      });

      // Create booking
      return tx.booking.create({
        data: {
          userId: req.user?.id || null as any,
          tourId: data.tourId,
          date: bookingDate,
          adults: data.adults,
          children: data.children,
          isPrivate: data.isPrivate,
          upsells: data.upsells ? JSON.parse(JSON.stringify(data.upsells)) : undefined,
          totalPrice,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          notes: data.notes,
        },
        include: {
          tour: { select: { title: true, slug: true } },
        },
      });
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
