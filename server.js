import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './backend/config/database.js';
import { errorHandler } from './backend/middleware/errorHandler.js';

import authRoutes from './backend/routes/authRoutes.js';
import productRoutes from './backend/routes/productRoutes.js';
import orderRoutes from './backend/routes/orderRoutes.js';
import categoryRoutes from './backend/routes/categoryRoutes.js';
import supplierRoutes from './backend/routes/supplierRoutes.js';
import stockRoutes from './backend/routes/stockRoutes.js';
import deliveryRoutes from './backend/routes/deliveryRoutes.js';
import wishlistRoutes from './backend/routes/wishlistRoutes.js';
import paymentRoutes from './backend/routes/paymentRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Context Diagram API routes
app.use('/api/auth', authRoutes);           // Customer/Staff/Admin: Login, Register, Profile
app.use('/api/products', productRoutes);    // Customer: Search | Staff: Manage Products
app.use('/api/categories', categoryRoutes); // Staff: Manage Categories
app.use('/api/orders', orderRoutes);        // Customer: Place Order | Staff: Manage Orders
app.use('/api/suppliers', supplierRoutes);  // Staff: Manage Suppliers
app.use('/api/stocks', stockRoutes);        // Staff: Manage Stocks
app.use('/api/deliveries', deliveryRoutes); // Staff: Manage Deliveries
app.use('/api/wishlist', wishlistRoutes);   // Customer: Manage Wishlist
app.use('/api/payments', paymentRoutes);    // Customer: Request Payment | Staff: Confirm
app.use('/api/admin', adminRoutes);         // Admin: Manage Users, Reports

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', system: 'MN T-Shirt E-Commerce Management System' });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync();
    console.log('All models were synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
