import { Router } from 'express';
import { createComanda, listComandas, updateComanda } from './comanda.controller';
import { requireAdmin } from '../../middlewares/requireAuth';
const r = Router();
r.post('/', requireAdmin, createComanda);
r.get('/', requireAdmin, listComandas);
r.patch('/:id', requireAdmin, updateComanda);
export default r;