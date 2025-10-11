import { Router } from 'express';
import { listProducts, upsertProduct } from './products.controller';
import { requireAdmin } from '../../middlewares/requireAuth';
const r = Router();
r.get('/', listProducts);
r.post('/', requireAdmin, upsertProduct);
r.patch('/:id', requireAdmin, upsertProduct);
export default r;