import type { BookingStatus, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

export async function transitionBookingStatus(
  tx: Prisma.TransactionClient,
  bookingId: string,
  toStatus: BookingStatus,
  options: { changedById?: string; note?: string } = {},
) {
  const booking = await tx.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status === toStatus) return booking;

  const guests = booking.adults + booking.children;
  const leavingCancelled = booking.status === 'CANCELLED' && toStatus !== 'CANCELLED';
  const enteringCancelled = booking.status !== 'CANCELLED' && toStatus === 'CANCELLED';

  if (leavingCancelled) {
    const reserved = await tx.availability.updateMany({
      where: { tourId: booking.tourId, date: booking.date, isBlocked: false, seatsAvailable: { gte: guests } },
      data: { seatsAvailable: { decrement: guests } },
    });
    if (reserved.count !== 1) throw new AppError('Not enough seats to reactivate this booking', 409);

    if (booking.promoCodeId && !booking.promoClaimedAt) {
      const promo = await tx.promoCode.findUnique({ where: { id: booking.promoCodeId } });
      if (!promo || !promo.isActive) throw new AppError('The booking promo code is no longer active', 409);
      const claimed = await tx.promoCode.updateMany({
        where: { id: promo.id, OR: [{ maxUses: null }, { usedCount: { lt: promo.maxUses ?? Number.MAX_SAFE_INTEGER } }] },
        data: { usedCount: { increment: 1 } },
      });
      if (claimed.count !== 1) throw new AppError('The booking promo code has reached its usage limit', 409);
    }
  }

  if (enteringCancelled) {
    await tx.availability.update({
      where: { tourId_date: { tourId: booking.tourId, date: booking.date } },
      data: { seatsAvailable: { increment: guests } },
    });
    if (booking.promoCodeId && booking.promoClaimedAt) {
      await tx.promoCode.update({ where: { id: booking.promoCodeId }, data: { usedCount: { decrement: 1 } } });
    }
  }

  const updated = await tx.booking.update({
    where: { id: booking.id },
    data: {
      status: toStatus,
      ...(leavingCancelled && booking.promoCodeId ? { promoClaimedAt: new Date() } : {}),
      ...(enteringCancelled ? { promoClaimedAt: null } : {}),
      statusHistory: {
        create: {
          fromStatus: booking.status,
          toStatus,
          changedById: options.changedById,
          note: options.note,
        },
      },
    },
  });
  return updated;
}

