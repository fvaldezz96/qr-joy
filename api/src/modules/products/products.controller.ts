import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../core/http';
import ProductModel from './product.model';


const UpsertDto = z.object({
name: z.string().min(2),
category: z.enum(['drink','food','ticket']),
price: z.number().nonnegative(),
active: z.boolean().default(true),
sku: z.string().optional(),
imageUrl: z.string().url().optional()
});


export const listProducts = asyncHandler(async (req: Request, res: Response) => {
const { category } = req.query as { category?: 'drink'|'food'|'ticket' };
const q: any = { active: true };
if (category) q.category = category;
const items = await ProductModel.find(q).lean();
res.json(ok(items));
});


export const upsertProduct = asyncHandler(async (req: Request, res: Response) => {
const body = UpsertDto.parse(req.body);
const id = req.params.id;
const doc = id ? await ProductModel.findByIdAndUpdate(id, body, { new: true }) : await ProductModel.create(body);
res.json(ok(doc));
});