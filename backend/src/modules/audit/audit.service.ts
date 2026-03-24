import { prisma } from '../../config/database';

export async function createAuditLog(data: {
  userId: string;
  action: string;
  detail: string;
  module: string;
  entityId?: string;
  entityType?: string;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({ data });
}

export async function getAuditLogs(filters: any) {
  const { module: mod, search, page = 1, limit = 50 } = filters;
  const where: any = {};
  if (mod) where.module = mod;
  if (search) {
    where.OR = [
      { action: { contains: search, mode: 'insensitive' } },
      { detail: { contains: search, mode: 'insensitive' } },
    ];
  }
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
    prisma.auditLog.count({ where }),
  ]);
  return { data, meta: { total, page, limit } };
}
