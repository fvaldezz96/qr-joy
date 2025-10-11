import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../core/http';
import UserModel from './user.model';


export const me = asyncHandler(async (req: any, res: Response) => {
const user = await UserModel.findById(req.user.id).select('_id email role').lean();
res.json(ok(user));
});


export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
const users = await UserModel.find({}).select('_id email role').lean();
res.json(ok(users));
});