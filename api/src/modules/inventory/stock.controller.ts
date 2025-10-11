import { Request, Response } from 'express';
import { z } from 'zod';

import { ok } from '../../core/http';
import { asyncHandler } from '../../utils/asyncHandler';
import { Stock } from './stock.model';

export const listStock = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Stock.find({}).populate('productId').lean();
  res.json(ok(items));
});

const AdjustDto = z.object({
  quantity: z.number(),
  location: z.enum(['bar', 'restaurant', 'door']).optional(),
});
export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = AdjustDto.parse(req.body);
  const { productId } = req.params;
  const doc = await Stock.findOneAndUpdate(
    { productId },
    { $inc: { quantity } },
    { upsert: true, new: true },
  );
  res.json(ok(doc));
});
