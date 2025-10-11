import { Router } from 'express';

import { requireAdmin, requireAuth } from '../../middlewares/requireAuth';
import { login, register } from './auth.controller';
import { listUsers, me } from './users.controller';
const r = Router();
r.post('/register', register);
r.post('/login', login);
r.get('/me', requireAuth, me);
r.get('/', requireAdmin, listUsers);
export default r;
