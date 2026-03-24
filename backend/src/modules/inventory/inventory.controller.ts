import { Request, Response, NextFunction } from 'express';
import * as inventoryService from './inventory.service';
import { success, error } from '../../utils/apiResponse';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await inventoryService.getInventoryItems({
      status: req.query.status as string,
      category: req.query.category as string,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventoryService.getInventoryItemById(String(req.params.id));
    if (!item) return error(res, 'Item not found', 404);
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventoryService.createInventoryItem(req.body);
    return success(res, item, undefined, 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventoryService.updateInventoryItem(String(req.params.id), req.body);
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

export async function adjust(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await inventoryService.adjustStock({
      ...req.body,
      adjustedBy: req.user?.name ?? 'System',
    });
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getExpiryAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await inventoryService.getExpiryAlerts();
    return success(res, items);
  } catch (err) {
    next(err);
  }
}
