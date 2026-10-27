import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import sequelize from './backend/config/database.js';
import authRoutes from './backend/routes/authRoutes.js';
import productRoutes from './backend/routes/productRoutes.js';
import categoryRoutes from './backend/routes/categoryRoutes.js';
import orderRoutes from './backend/routes/orderRoutes.js';
import supplierRoutes from './backend/routes/supplierRoutes.js';
import stockRoutes from './backend/routes/stockRoutes.js';
import deliveryRoutes from './backend/routes/deliveryRoutes.js';
import wishlistRoutes from './backend/routes/wishlistRoutes.js';
import paymentRoutes from './backend/routes/paymentRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';
import cartRoutes from './backend/routes/cartRoutes.js';
import storeInfoRoutes from './backend/routes/storeInfoRoutes.js';
import { errorHandler } from './backend/middleware/errorHandler.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/store-info', storeInfoRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'API is running', database: 'connected' });
});

app.use('/api', errorHandler);

// Vite Middleware & Static Serving
async function startServer() {
  await sequelize.authenticate();
  // `alter: true` re-adds every UNIQUE index on each start, eventually hitting
  // MySQL's 64-key limit. Opt in via DB_SYNC_ALTER=true only after model changes.
  await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MN T-Shirt Clothing Fullstack Server running at http://localhost:${PORT}`);
  });
}

startServer();
