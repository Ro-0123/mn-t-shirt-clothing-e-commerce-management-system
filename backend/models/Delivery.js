import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'packed', 'shipped', 'in_transit', 'delivered', 'returned', 'failed'),
    defaultValue: 'pending',
  },
  courierName: {
    type: DataTypes.STRING,
  },
  trackingNumber: {
    type: DataTypes.STRING,
  },
  shippingAddress: {
    type: DataTypes.JSON,
  },
  shippedAt: {
    type: DataTypes.DATE,
  },
  deliveredAt: {
    type: DataTypes.DATE,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'deliveries',
  timestamps: true,
});

export default Delivery;
