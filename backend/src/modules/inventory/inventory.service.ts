import { prisma } from '../../config/database';
import { differenceInDays } from 'date-fns';

export async function getInventoryItems(filters: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const { status, category, search, page = 1, limit = 20, sortBy = 'expiryDate', sortOrder = 'asc' } = filters;

  const where: any = {};
  if (status) where.qaStatus = status;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { itemName: { contains: search, mode: 'insensitive' } },
      { itemCode: { contains: search, mode: 'insensitive' } },
      { batchNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  const today = new Date();
  const enriched = items.map((item) => {
    const daysToExpiry = differenceInDays(item.expiryDate, today);
    return {
      ...item,
      daysToExpiry,
      expiryStatus: daysToExpiry <= 30 ? 'critical' : daysToExpiry <= 60 ? 'warning' : 'ok',
    };
  });

  // Expiry breakdown
  const all = await prisma.inventoryItem.findMany({ select: { expiryDate: true } });
  const expiryBreakdown = all.reduce(
    (acc, i) => {
      const d = differenceInDays(i.expiryDate, today);
      if (d <= 30) acc.critical++;
      else if (d <= 60) acc.warning++;
      else if (d <= 90) acc.warning60++;
      else acc.ok++;
      return acc;
    },
    { critical: 0, warning: 0, warning60: 0, ok: 0 }
  );

  return { data: enriched, meta: { total, page, limit, expiryBreakdown } };
}

export async function getInventoryItemById(id: string) {
  return prisma.inventoryItem.findUnique({ where: { id }, include: { adjustments: true, grn: true } });
}

export async function createInventoryItem(data: any) {
  return prisma.inventoryItem.create({ data });
}

export async function updateInventoryItem(id: string, data: any) {
  return prisma.inventoryItem.update({ where: { id }, data });
}

export async function adjustStock(data: {
  inventoryItemId: string;
  adjustmentType: string;
  qty: number;
  reason: string;
  adjustedBy: string;
  referenceNo?: string;
}) {
  const item = await prisma.inventoryItem.findUnique({ where: { id: data.inventoryItemId } });
  if (!item) throw Object.assign(new Error('Item not found'), { statusCode: 404 });

  const qtyBefore = item.qtyOnHand;
  const qtyAfter = data.adjustmentType === 'POSITIVE'
    ? qtyBefore + data.qty
    : Math.max(0, qtyBefore - data.qty);

  return prisma.$transaction([
    prisma.stockAdjustment.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        adjustmentType: data.adjustmentType,
        qtyBefore,
        qtyAfter,
        adjustedBy: data.adjustedBy,
        reason: data.reason,
        referenceNo: data.referenceNo,
      },
    }),
    prisma.inventoryItem.update({
      where: { id: data.inventoryItemId },
      data: { qtyOnHand: qtyAfter },
    }),
  ]);
}

export async function getExpiryAlerts() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + 30);
  return prisma.inventoryItem.findMany({
    where: { expiryDate: { lte: cutoff }, qaStatus: 'APPROVED' },
    orderBy: { expiryDate: 'asc' },
  });
}
