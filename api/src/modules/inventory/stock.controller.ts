import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../core/http';
import StockModel from './stock.model';


export const listStock = asyncHandler(async (_req: Request, res: Response) => {
const items = await StockModel.find({}).populate('productId').lean();
res.json(ok(items));
});


const AdjustDto = z.object({ quantity: z.number(), location: z.enum(['bar','restaurant','door']).optional() });
export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
const { quantity } = AdjustDto.parse(req.body);
const { productId } = req.params;
const doc = await StockModel.findOneAndUpdate(
{ productId },
{ $inc: { quantity } },
{ upsert: true, new: true }
);
res.json(ok(doc));
});