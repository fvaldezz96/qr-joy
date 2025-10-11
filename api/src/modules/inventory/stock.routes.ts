import { Router } from 'express';
import { listStock, adjustStock } from './stock.controller';
import { requireAdmin } from '../../middlewares/requireAuth';
const r = Router();
r.get('/', requireAdmin, listStock);
r.patch('/:productId', requireAdmin, adjustStock);
export default r; 