import User from './User.js';
import Category from './Category.js';
import Supplier from './Supplier.js';
import Product from './Product.js';
import Stock from './Stock.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Delivery from './Delivery.js';
import Payment from './Payment.js';
import Cart from './Cart.js';
import Wishlist from './Wishlist.js';
import Report from './Report.js';
import StoreInfo from './StoreInfo.js';

// Categories & Products
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Supplier.hasMany(Product, { foreignKey: 'supplierId' });
Product.belongsTo(Supplier, { foreignKey: 'supplierId' });

Product.hasOne(Stock, { foreignKey: 'productId', onDelete: 'CASCADE' });
Stock.belongsTo(Product, { foreignKey: 'productId' });

// Users & Orders
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Order.hasOne(Delivery, { foreignKey: 'orderId', onDelete: 'CASCADE' });
Delivery.belongsTo(Order, { foreignKey: 'orderId' });

Order.hasMany(Payment, { foreignKey: 'orderId', onDelete: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// Cart & Wishlist
User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Wishlist, { foreignKey: 'userId', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Wishlist, { foreignKey: 'productId', onDelete: 'CASCADE' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Report, { foreignKey: 'requestedBy' });
Report.belongsTo(User, { foreignKey: 'requestedBy' });

export {
  User,
  Category,
  Supplier,
  Product,
  Stock,
  Order,
  OrderItem,
  Delivery,
  Payment,
  Cart,
  Wishlist,
  Report,
  StoreInfo,
};
