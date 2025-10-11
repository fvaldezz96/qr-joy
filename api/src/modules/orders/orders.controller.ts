import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../core/http';
import OrderModel from './order.model';
import StockModel from '../inventory/stock.model';
import { issueQR } from '../qr/qr.service';
import { AuthedRequest } from '../../middlewares/requireAuth';


const CreateOrderDto = z.object({
type: z.enum(['bar','restaurant']),
tableId: z.string().optional(),
items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive(), price: z.number().nonnegative(), note: z.string().optional() })).min(1)
});


export const createOrder = asyncHandler(async (req: AuthedRequest, res: Response) => {
const { type, tableId, items } = CreateOrderDto.parse(req.body);
const total = items.reduce((a, b) => a + b.qty * b.price, 0);
const order = await OrderModel.create({ userId: req.user?.id, type, tableId, items, total, status: 'pending' });
res.json(ok(order));
});


export const listOrders = asyncHandler(async (req: Request, res: Response) => {
const { status, type, tableId } = req.query as any;
const q: any = {};
if (status) q.status = status;
if (type) q.type = type;
if (tableId) q.tableId = tableId;
const items = await OrderModel.find(q).sort({ createdAt: -1 }).lean();
res.json(ok(items));
});


// Pago Mock: descuenta stock + emite QR
export const payMockOrder = asyncHandler(async (req: AuthedRequest, res: Response) => {
const id = req.params.id;
const session = await mongoose.startSession();
session.startTransaction();
try {
const order = await OrderModel.findById(id).session(session);
if (!order) throw new Error('ORDER_NOT_FOUND');
if (order.status !== 'pending') throw new Error('INVALID_STATUS');


// Descontar stock
for (const it of order.items) {
const st = await StockModel.findOne({ productId: it.productId }).session(session);
if (!st || st.quantity < it.qty) throw new Error('INSUFFICIENT_STOCK');
st.quantity -= it.qty;
await st.save({ session });
}


order.status = 'paid';
await order.save({ session });


const { png, qr } = await issueQR('order', order._id, session);
order.qrId = qr._id;
await order.save({ session });


await session.commitTransaction();
res.json(ok({ orderId: order._id, pngDataUrl: png, code: qr.code, signature: qr.signature }));
} catch (e) {
await session.abortTransaction();
throw e;
} finally {
session.endSession();
}
});


export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
const { id } = req.params; const { status } = req.body as { status: string };
const allowed = ['pending','paid','ready','served','cancelled'];
if (!allowed.includes(status)) return res.status(400).json({ ok:false, error:{ code:'INVALID_STATUS', message:'Estado inválido' }});
const doc = await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
res.json(ok(doc));
});