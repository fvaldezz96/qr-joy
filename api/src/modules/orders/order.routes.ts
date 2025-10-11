import { Router } from 'express';
import { createOrder, listOrders, payMockOrder, updateOrderStatus } from './orders.controller';
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth';
const r = Router();
r.post('/', requireAuth, createOrder);
r.get('/', requireAdmin, listOrders);
r.post('/:id/pay-mock', requireAuth, payMockOrder);
r.patch('/:id/status', requireAdmin, updateOrderStatus);
export default r;