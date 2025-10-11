import { Router } from 'express';
import { createTicket, payMockTicket, myTickets } from './tickets.controller';
import { requireAuth } from '../../middlewares/requireAuth';
const r = Router();
r.post('/', requireAuth, createTicket);
r.post('/:id/pay-mock', requireAuth, payMockTicket);
r.get('/me', requireAuth, myTickets);
export default r;