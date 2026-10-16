import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StoreInfo = sequelize.define('StoreInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1,
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: 'MN T-Shirt Clothing Co.',
  },
  email: {
    type: DataTypes.STRING,
    defaultValue: 'support@mntshirt.com',
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: '+855 23 999 888',
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: 'Street 271, Sangkat Toul Tompoung, Khan Chamkarmon, Phnom Penh',
  },
  returnPolicy: {
    type: DataTypes.TEXT,
    defaultValue: '14-day hassle-free exchanges on unworn garments with original hangtags intact.',
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD ($)',
  },
  freeShippingThreshold: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 50.0,
  },
  standardShippingFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 3.5,
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 7.0,
  },
}, {
  tableName: 'store_info',
  timestamps: true,
});

export default StoreInfo;
