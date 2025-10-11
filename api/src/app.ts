import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userAuthRoutes from './modules/users/user.routes';
import usersRoutes from './modules/users/users.routes';
import productRoutes from './modules/products/product.routes';
import stockRoutes from './modules/inventory/stock.routes';
import orderRoutes from './modules/orders/order.routes';
import ticketRoutes from './modules/tickets/ticket.routes';
import qrRoutes from './modules/qr/qr.routes';
import tableRoutes from './modules/tables/table.routes';
import comandaRoutes from './modules/tables/comanda.routes';


export const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));


app.use('/auth', userAuthRoutes);
app.use('/users', usersRoutes);
app.use('/products', productRoutes);
app.use('/stock', stockRoutes);
app.use('/orders', orderRoutes);
app.use('/tickets', ticketRoutes);
app.use('/qr', qrRoutes);
app.use('/tables', tableRoutes);
app.use('/comandas', comandaRoutes);


// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
console.error(err);
res.status(err.status || 500).json({ ok:false, error:{ code: err.code || 'INTERNAL', message: err.message || 'Internal Error' } });
});