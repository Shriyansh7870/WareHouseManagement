import { Request, Response, NextFunction } from 'express';
import * as grnService from './grn.service';
import { success, error } from '../../utils/apiResponse';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await grnService.getGRNs(req.query);
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const grn = await grnService.createGRN(req.body, req.user!.userId);
    return success(res, grn, undefined, 201);
  } catch (err) { next(err); }
}

export async function qaDecision(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await grnService.qaDecision(String(req.params.id), String(req.body.decision), String(req.body.remarks), String(req.user!.userId));
    return success(res, result);
  } catch (err) { next(err); }
}

export async function getASNs(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grnService.getASNs(req.query);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function createASN(req: Request, res: Response, next: NextFunction) {
  try {
    const asn = await grnService.createASN(req.body);
    return success(res, asn, undefined, 201);
  } catch (err) { next(err); }
}
