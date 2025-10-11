import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../core/http';
import TicketModel from './ticket.model';
import { issueQR } from '../qr/qr.service';
import { AuthedRequest } from '../../middlewares/requireAuth';


const CreateTicketDto = z.object({ eventDate: z.coerce.date(), price: z.number().nonnegative() });
export const createTicket = asyncHandler(async (req: AuthedRequest, res: Response) => {
const { eventDate, price } = CreateTicketDto.parse(req.body);
const ticket = await TicketModel.create({ userId: req.user!.id, eventDate, price, status: 'issued' });
res.json(ok(ticket));
});


export const payMockTicket = asyncHandler(async (req: AuthedRequest, res: Response) => {
const id = req.params.id;
const session = await mongoose.startSession();
session.startTransaction();
try {
const t = await TicketModel.findById(id).session(session);
if (!t) throw new Error('TICKET_NOT_FOUND');
if (t.status !== 'issued') throw new Error('INVALID_STATUS');
t.status = 'paid';
await t.save({ session });


const { png, qr } = await issueQR('ticket', t._id, session);
t.qrId = qr._id;
await t.save({ session });


await session.commitTransaction();
res.json(ok({ ticketId: t._id, pngDataUrl: png, code: qr.code, signature: qr.signature }));
} catch (e) {
await session.abortTransaction();
throw e;
} finally { session.endSession(); }
});


export const myTickets = asyncHandler(async (req: AuthedRequest, res: Response) => {
const items = await TicketModel.find({ userId: req.user!.id }).sort({ createdAt: -1 }).lean();
res.json(ok(items));
});