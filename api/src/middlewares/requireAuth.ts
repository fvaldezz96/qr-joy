import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export interface AuthedRequest extends Request { user?: { id: string; role: 'user'|'admin' }; }
export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction){
const hdr = req.headers.authorization;
if(!hdr?.startsWith('Bearer ')) return next(new Error('No token'));
const token = hdr.slice(7);
const payload = jwt.verify(token, process.env.JWT_SECRET! ) as any;
req.user = { id: payload.sub, role: payload.role };
next();
}
export function requireAdmin(req: AuthedRequest, _res: Response, next: NextFunction){
if(!req.user) return next(new Error('No user'));
if(req.user.role !== 'admin') return next(new Error('Admin only'));
next();
}