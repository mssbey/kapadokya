import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { mediaStorage } from '../services/storage';
import { invalidateCache } from '../lib/redis';
import { writeAudit } from '../lib/audit';

export const adminMediaRouter = Router();

const MAX_IMAGE_BYTES = Number(process.env.MAX_IMAGE_UPLOAD_MB || 8) * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 10 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) return callback(new AppError('Only JPG, PNG and WebP images are accepted', 400));
    callback(null, true);
  },
});

adminMediaRouter.use(authenticate, requireAdmin);

function runUpload(req: any, res: any) {
  return new Promise<void>((resolve, reject) => {
    upload.array('images', 10)(req, res, (error) => {
      if (!error) return resolve();
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return reject(new AppError(`Each image must be at most ${process.env.MAX_IMAGE_UPLOAD_MB || 8} MB`, 413));
      }
      reject(error);
    });
  });
}

// Generic single-image upload, not tied to a tour — used by admin sections
// (e.g. category cover images) that just need a hosted URL back.
adminMediaRouter.post('/media/upload', async (req: AuthRequest, res, next) => {
  try {
    await runUpload(req, res);
    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length) throw new AppError('Select an image', 400);
    const image = await mediaStorage.uploadImage(files[0].buffer, files[0].originalname);
    await writeAudit(req, 'MEDIA_UPLOADED', 'Media', image.storageKey);
    res.status(201).json({ success: true, data: { secureUrl: image.secureUrl, storageKey: image.storageKey } });
  } catch (error) {
    next(error);
  }
});

adminMediaRouter.post('/tours/:tourId/images', async (req: AuthRequest, res, next) => {
  const uploaded: { storageKey: string }[] = [];
  try {
    await runUpload(req, res);
    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length) throw new AppError('Select at least one image', 400);

    const tour = await prisma.tour.findFirst({ where: { id: req.params.tourId, deletedAt: null }, select: { id: true } });
    if (!tour) throw new AppError('Tour not found', 404);

    const existingCount = await prisma.tourImage.count({ where: { tourId: tour.id } });
    const stored = [];
    for (const file of files) {
      const image = await mediaStorage.uploadImage(file.buffer, file.originalname);
      uploaded.push({ storageKey: image.storageKey });
      stored.push(image);
    }

    const created = await prisma.$transaction(
      stored.map((image, index) =>
        prisma.tourImage.create({
          data: {
            tourId: tour.id,
            ...image,
            sortOrder: existingCount + index,
            isCover: existingCount === 0 && index === 0,
          },
        }),
      ),
    );

    await invalidateCache('tours:*');
    await invalidateCache(`tour:*:${tour.id}`);
    await writeAudit(req, 'TOUR_IMAGES_UPLOADED', 'Tour', tour.id, { count: created.length });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    if (uploaded.length) await Promise.allSettled(uploaded.map((item) => mediaStorage.deleteImage(item.storageKey)));
    next(error);
  }
});

const externalImageSchema = z.object({
  url: z.string().url(),
  altText: z.string().max(300).optional(),
});

adminMediaRouter.post('/tours/:tourId/images/external', async (req: AuthRequest, res, next) => {
  try {
    const data = externalImageSchema.parse(req.body);
    const url = new URL(data.url);
    if (url.protocol !== 'https:') throw new AppError('External image URLs must use HTTPS', 400);
    const allowed = (process.env.ALLOWED_MEDIA_HOSTS || 'res.cloudinary.com')
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean);
    if (!allowed.includes(url.hostname.toLowerCase())) throw new AppError('This image host is not allowed', 400);

    const count = await prisma.tourImage.count({ where: { tourId: req.params.tourId } });
    const image = await prisma.tourImage.create({
      data: {
        tourId: req.params.tourId,
        provider: 'EXTERNAL',
        secureUrl: data.url,
        altText: data.altText,
        sortOrder: count,
        isCover: count === 0,
      },
    });
    await invalidateCache('tours:*');
    await writeAudit(req, 'TOUR_EXTERNAL_IMAGE_ADDED', 'Tour', req.params.tourId, { imageId: image.id });
    res.status(201).json({ success: true, data: image });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

const reorderSchema = z.object({
  imageIds: z.array(z.string().uuid()).min(1).max(100),
  coverId: z.string().uuid(),
});

adminMediaRouter.patch('/tours/:tourId/images/reorder', async (req: AuthRequest, res, next) => {
  try {
    const data = reorderSchema.parse(req.body);
    if (!data.imageIds.includes(data.coverId)) throw new AppError('Cover image must be in the ordered image list', 400);
    const owned = await prisma.tourImage.count({ where: { tourId: req.params.tourId, id: { in: data.imageIds } } });
    if (owned !== data.imageIds.length) throw new AppError('One or more images do not belong to this tour', 400);

    await prisma.$transaction([
      prisma.tourImage.updateMany({ where: { tourId: req.params.tourId }, data: { isCover: false } }),
      ...data.imageIds.map((id, sortOrder) => prisma.tourImage.update({ where: { id }, data: { sortOrder, isCover: id === data.coverId } })),
    ]);
    await invalidateCache('tours:*');
    await writeAudit(req, 'TOUR_IMAGES_REORDERED', 'Tour', req.params.tourId, { coverId: data.coverId });
    const images = await prisma.tourImage.findMany({ where: { tourId: req.params.tourId }, orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] });
    res.json({ success: true, data: images });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminMediaRouter.patch('/tours/:tourId/images/:imageId', async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ altText: z.string().max(300).nullable().optional(), isCover: z.boolean().optional() }).parse(req.body);
    const existing = await prisma.tourImage.findFirst({ where: { id: req.params.imageId, tourId: req.params.tourId } });
    if (!existing) throw new AppError('Image not found', 404);
    const updates = [];
    if (data.isCover) updates.push(prisma.tourImage.updateMany({ where: { tourId: req.params.tourId }, data: { isCover: false } }));
    updates.push(prisma.tourImage.update({ where: { id: existing.id }, data: { altText: data.altText, isCover: data.isCover ?? existing.isCover } }));
    const results = await prisma.$transaction(updates);
    await invalidateCache('tours:*');
    await writeAudit(req, 'TOUR_IMAGE_UPDATED', 'TourImage', existing.id);
    res.json({ success: true, data: results[results.length - 1] });
  } catch (error) {
    if (error instanceof z.ZodError) return next(new AppError(error.errors[0].message, 400));
    next(error);
  }
});

adminMediaRouter.delete('/tours/:tourId/images/:imageId', async (req: AuthRequest, res, next) => {
  try {
    const image = await prisma.tourImage.findFirst({ where: { id: req.params.imageId, tourId: req.params.tourId } });
    if (!image) throw new AppError('Image not found', 404);

    await prisma.$transaction(async (tx) => {
      await tx.tourImage.delete({ where: { id: image.id } });
      if (image.isCover) {
        const nextCover = await tx.tourImage.findFirst({ where: { tourId: image.tourId }, orderBy: { sortOrder: 'asc' } });
        if (nextCover) await tx.tourImage.update({ where: { id: nextCover.id }, data: { isCover: true } });
      }
    });

    if (image.provider === 'CLOUDINARY' && image.storageKey) {
      const references = await prisma.tourImage.count({ where: { storageKey: image.storageKey } });
      if (references === 0) await mediaStorage.deleteImage(image.storageKey);
    }

    await invalidateCache('tours:*');
    await writeAudit(req, 'TOUR_IMAGE_DELETED', 'TourImage', image.id, { tourId: image.tourId });
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
});

