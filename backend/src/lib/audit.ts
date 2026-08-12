import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import type { AuthRequest } from '../middleware/auth';

export async function writeAudit(
  req: Request | AuthRequest,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Prisma.InputJsonValue,
) {
  const actorId = (req as AuthRequest).user?.id;
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')?.slice(0, 500),
    },
  });
}

