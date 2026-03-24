import { prisma } from '../../config/database';

async function generateGRNNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.gRN.count();
  return `GRN-${year}-${String(count + 1).padStart(4, '0')}`;
}

async function generateASNNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.aSN.count();
  return `ASN-${year}-${String(count + 1).padStart(4, '0')}`;
}

export async function getGRNs(filters: any) {
  const { status, vendorId, search, page = 1, limit = 20 } = filters;
  const where: any = {};
  if (status) where.status = status;
  if (vendorId) where.vendorId = vendorId;
  if (search) {
    where.OR = [
      { grnNumber: { contains: search, mode: 'insensitive' } },
      { itemName: { contains: search, mode: 'insensitive' } },
      { batchNumber: { contains: search, mode: 'insensitive' } },
    ];
  }
  const [data, total] = await Promise.all([
    prisma.gRN.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { vendor: true, receivedBy: true } }),
    prisma.gRN.count({ where }),
  ]);
  return { data, meta: { total, page, limit } };
}

export async function createGRN(data: any, receivedById: string) {
  const grnNumber = await generateGRNNumber();
  const grn = await prisma.gRN.create({
    data: {
      grnNumber,
      vendorId: data.vendorId,
      poId: data.poId,
      asnId: data.asnId,
      itemName: data.itemName,
      itemCode: data.itemCode,
      batchNumber: data.batchNumber,
      qtyReceived: data.qtyReceived,
      unit: data.unit,
      mfgDate: new Date(data.mfgDate),
      expiryDate: new Date(data.expiryDate),
      vehicleLR: data.vehicleLR,
      storageLocation: data.storageLocation,
      receivedById,
      coaDocId: data.coaDocId,
      remarks: data.remarks,
    },
  });

  // Auto-create inventory item
  await prisma.inventoryItem.create({
    data: {
      itemCode: data.itemCode,
      itemName: data.itemName,
      category: data.category ?? 'FINISHED_GOODS',
      batchNumber: data.batchNumber,
      mfgDate: new Date(data.mfgDate),
      expiryDate: new Date(data.expiryDate),
      qtyOnHand: data.qtyReceived,
      unit: data.unit,
      reorderLevel: data.reorderLevel ?? 1000,
      storageLocation: data.storageLocation,
      qaStatus: 'PENDING_QA',
      grnId: grn.id,
    },
  });

  if (data.asnId) {
    await prisma.aSN.update({ where: { id: data.asnId }, data: { status: 'RECEIVED' } });
  }

  return grn;
}

export async function qaDecision(grnId: string, decision: string, remarks: string, userId: string) {
  const grn = await prisma.gRN.findUnique({ where: { id: grnId } });
  if (!grn) throw Object.assign(new Error('GRN not found'), { statusCode: 404 });

  const qaStatusMap: Record<string, string> = {
    APPROVE: 'APPROVED',
    QUARANTINE: 'QUARANTINE',
    REJECT: 'REJECTED',
  };

  const grnStatusMap: Record<string, string> = {
    APPROVE: 'APPROVED',
    QUARANTINE: 'QUARANTINE',
    REJECT: 'REJECTED',
  };

  await prisma.$transaction([
    prisma.gRN.update({ where: { id: grnId }, data: { status: grnStatusMap[decision] as any } }),
    prisma.inventoryItem.updateMany({ where: { grnId }, data: { qaStatus: qaStatusMap[decision] as any } }),
  ]);

  return { success: true };
}

export async function getASNs(filters: any) {
  const where: any = {};
  if (filters.status) where.status = filters.status;
  return prisma.aSN.findMany({ where, orderBy: { createdAt: 'desc' }, include: { vendor: true } });
}

export async function createASN(data: any) {
  const asnNumber = await generateASNNumber();
  return prisma.aSN.create({ data: { asnNumber, ...data } });
}
