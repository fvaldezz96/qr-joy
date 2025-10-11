import { ClientSession, Types } from 'mongoose';
import QRCode from 'qrcode';
import crypto from 'crypto';
import QrModel from './qr.model';
import OrderModel from '../orders/order.model';
import TicketModel from '../tickets/ticket.model';


export type QRKind = 'order'|'ticket';


const ttlMinutes = Number(process.env.QR_TTL_MINUTES || 240);
const secret = process.env.APP_SECRET!;


function hmac(code: string){
return crypto.createHmac('sha256', secret).update(code).digest('hex');
}


export async function issueQR(kind: QRKind, refId: Types.ObjectId, session?: ClientSession){
const code = Math.random().toString(36).slice(2, 14);
const signature = hmac(code);
const expiresAt = ttlMinutes ? new Date(Date.now() + ttlMinutes*60*1000) : undefined;
const qr = await QrModel.create([{ kind, refId, code, signature, state:'active', createdAt:new Date(), expiresAt }], { session }).then(r=>r[0]);
const payload = JSON.stringify({ c: code, s: signature });
const png = await QRCode.toDataURL(payload);
return { qr, png };
}


export async function redeem(code: string, signature: string, staffId: Types.ObjectId){
const qr = await QrModel.findOneAndUpdate(
{ code, signature, state: 'active', $or: [ { expiresAt: { $exists:false } }, { expiresAt: { $gt: new Date() } } ] },
{ $set: { state: 'redeemed', redeemedAt: new Date(), redeemedBy: staffId } },
{ new: true }
);
if (!qr) throw new Error('INVALID_OR_USED');
if (qr.kind === 'order') await OrderModel.updateOne({ _id: qr.refId }, { $set: { status: 'served' } });
if (qr.kind === 'ticket') await TicketModel.updateOne({ _id: qr.refId }, { $set: { status: 'redeemed' } });
return qr;
}