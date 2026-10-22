import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    // Same methods as orders.paymentMethod
    type: DataTypes.ENUM('paypal', 'bank_transfer', 'cash_on_delivery', 'payway_card', 'payway_qr', 'store_credit'),
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  paidAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'payments',
  timestamps: true,
});

export default Payment;
