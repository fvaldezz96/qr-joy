import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../core/http';
import TableModel from './table.model';


const UpsertTable = z.object({ name: z.string().min(1), capacity: z.number().int().positive(), active: z.boolean().default(true) });
export const listTables = asyncHandler(async (_req: Request, res: Response) => {
const items = await TableModel.find({}).lean(); res.json(ok(items));
});
export const createTable = asyncHandler(async (req: Request, res: Response) => {
const doc = await TableModel.create(UpsertTable.parse(req.body)); res.json(ok(doc));
});