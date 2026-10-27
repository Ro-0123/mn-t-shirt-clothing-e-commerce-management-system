import { Op, literal } from 'sequelize';
import { User, Order, OrderItem, Product, Category, Stock, Payment, Report, Delivery } from '../models/index.js';
import { serializeOrder } from './orderController.js';
import { parseJsonArray } from './productController.js';

const serializeUser = (user) => {
  const u = user.toJSON ? user.toJSON() : user;
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    avatar: u.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: u.phone || '',
    address: u.address || '',
    createdAt: u.createdAt,
    status: u.isActive ? 'Active' : 'Blocked',
    storeCredit: Number(u.storeCredit || 0),
  };
};

// "YYYY-MM" -> midnight on the 1st of that month (server time), or null
const monthStart = (ym) => {
  const m = /^(\d{4})-(\d{2})$/.exec(ym || '');
  return m && Number(m[2]) >= 1 && Number(m[2]) <= 12 ? new Date(Number(m[1]), Number(m[2]) - 1, 1) : null;
};

// { from: 'YYYY-MM', to: 'YYYY-MM' } -> { start, end (exclusive), months }.
// Returns undefined when neither is given and null when the range is invalid.
const parseMonthRange = ({ from, to } = {}) => {
  if (!from && !to) return undefined;
  const start = monthStart(from);
  const last = monthStart(to);
  if (!start || !last || last < start) return null;
  const months = (last.getFullYear() - start.getFullYear()) * 12 + (last.getMonth() - start.getMonth()) + 1;
  return { start, end: new Date(last.getFullYear(), last.getMonth() + 1, 1), months };
};

const createdBetween = ({ start, end }) => ({ createdAt: { [Op.gte]: start, [Op.lt]: end } });

export const getAnalytics = async (req, res, next) => {
  try {
    const range = parseMonthRange(req.query);
    if (range === null) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    // Order-based figures cover only the chosen months; product, customer and stock counts are always current
    const inRange = range ? createdBetween(range) : {};

    const [totalOrders, completedOrders, activeProductsCount, customerCount, lowStockCount, totalRevenue] = await Promise.all([
      Order.count({ where: { ...inRange, status: { [Op.ne]: 'cancelled' } } }),
      Order.count({ where: { ...inRange, status: 'delivered' } }),
      Product.count({ where: { isActive: true } }),
      User.count({ where: { role: 'customer' } }),
      Stock.count({ where: literal('quantity <= minStockLevel') }),
      Order.sum('finalAmount', { where: { ...inRange, paymentStatus: 'completed' } }),
    ]);

    const orderItems = await OrderItem.findAll({
      include: [
        { model: Product, attributes: ['id', 'name', 'sku', 'images', 'image', 'categoryId'], include: [{ model: Category, attributes: ['name'] }] },
        { model: Order, attributes: ['paymentStatus'], where: { ...inRange, paymentStatus: 'completed' } },
      ],
    });

    const categoryRevenue = {};
    const productSalesMap = {};
    orderItems.forEach((item) => {
      const revenue = Number(item.price) * item.quantity;
      const catName = item.Product?.Category?.name || 'Other';
      categoryRevenue[catName] = (categoryRevenue[catName] || 0) + revenue;

      if (item.Product) {
        const key = item.Product.id;
        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            name: item.Product.name,
            sku: item.Product.sku,
            unitsSold: 0,
            revenue: 0,
            image: parseJsonArray(item.Product.images)[0] || item.Product.image || '',
          };
        }
        productSalesMap[key].unitsSold += item.quantity;
        productSalesMap[key].revenue += revenue;
      }
    });

    const topSelling = Object.values(productSalesMap).sort((a, b) => b.unitsSold - a.unitsSold);

    // Paid orders drive average order value, delivery rate and the period comparison.
    // The comparison is the chosen months vs the same number of months just before
    // them, or (no range) the last 30 days vs the 30 days before that.
    const DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const currentPeriod = range || { start: new Date(now - 30 * DAY), end: new Date(now) };
    const previousPeriod = range
      ? { start: new Date(range.start.getFullYear(), range.start.getMonth() - range.months, 1), end: range.start }
      : { start: new Date(now - 60 * DAY), end: currentPeriod.start };
    const [paidOrdersCount, paidDeliveredCount, allOrdersCount, cancelledCount, revenueCurrentPeriod, revenuePreviousPeriod] = await Promise.all([
      Order.count({ where: { ...inRange, paymentStatus: 'completed' } }),
      Order.count({ where: { ...inRange, paymentStatus: 'completed', status: 'delivered' } }),
      Order.count({ where: inRange }),
      Order.count({ where: { ...inRange, status: 'cancelled' } }),
      Order.sum('finalAmount', { where: { ...createdBetween(currentPeriod), paymentStatus: 'completed' } }),
      Order.sum('finalAmount', { where: { ...createdBetween(previousPeriod), paymentStatus: 'completed' } }),
    ]);
    const round2 = (n) => Math.round((n || 0) * 100) / 100;
    const revenueChangePct = revenuePreviousPeriod > 0
      ? round2(((revenueCurrentPeriod || 0) - revenuePreviousPeriod) / revenuePreviousPeriod * 100)
      : null; // nothing to compare against

    const recentOrders = await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'images', 'image'] }] },
        { model: Delivery },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.status(200).json({
      totalRevenue: Math.round((totalRevenue || 0) * 100) / 100,
      totalOrdersCount: totalOrders,
      completedOrders,
      activeProductsCount,
      lowStockCount,
      customerCount,
      categoryRevenue: Object.fromEntries(Object.entries(categoryRevenue).map(([name, revenue]) => [name, round2(revenue)])),
      topSelling: topSelling.map((p) => ({ ...p, revenue: round2(p.revenue) })),
      paidOrdersCount,
      paidDeliveredCount,
      allOrdersCount,
      cancelledCount,
      avgOrderValue: paidOrdersCount ? round2((totalRevenue || 0) / paidOrdersCount) : 0,
      revenueCurrentPeriod: round2(revenueCurrentPeriod),
      revenuePreviousPeriod: round2(revenuePreviousPeriod),
      revenueChangePct,
      recentOrders: recentOrders.map(serializeOrder),
    });
  } catch (error) {
    next(error);
  }
};

// `range` limits the order/sales figures to those months; users and stocks are always a current snapshot
const buildReportData = async (reportType, range) => {
  const inRange = range ? createdBetween(range) : {};

  if (reportType === 'users') {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    return {
      totalUsers: users.length,
      byRole: {
        customer: users.filter((u) => u.role === 'customer').length,
        staff: users.filter((u) => u.role === 'staff').length,
        admin: users.filter((u) => u.role === 'admin').length,
      },
      users,
    };
  }

  if (reportType === 'orders') {
    const orders = await Order.findAll({ where: inRange, order: [['createdAt', 'DESC']] });
    const ordersByStatus = await Order.findAll({
      where: inRange,
      attributes: ['status', [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count']],
      group: ['status'],
    });
    return { totalOrders: orders.length, ordersByStatus, orders };
  }

  if (reportType === 'stocks') {
    const stocks = await Stock.findAll({ include: [Product] });
    const lowStockCount = await Stock.count({ where: literal('quantity <= minStockLevel') });
    return { totalStockRecords: stocks.length, lowStockCount, stocks };
  }

  if (reportType === 'sales') {
    const payments = await Payment.findAll({
      where: { status: 'completed', ...(range && { paidAt: { [Op.gte]: range.start, [Op.lt]: range.end } }) },
      include: [{ model: Order, attributes: ['orderNumber', 'finalAmount', 'createdAt'] }],
      order: [['paidAt', 'DESC']],
    });
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return { totalPayments: payments.length, totalRevenue, payments };
  }

  const [totalUsers, totalCustomers, totalStaff, totalOrders, totalRevenue, lowStockCount] = await Promise.all([
    User.count(),
    User.count({ where: { role: 'customer' } }),
    User.count({ where: { role: 'staff' } }),
    Order.count({ where: { ...inRange, status: { [Op.ne]: 'cancelled' } } }),
    Order.sum('finalAmount', { where: { ...inRange, paymentStatus: 'completed' } }),
    Stock.count({ where: literal('quantity <= minStockLevel') }),
  ]);

  return {
    totalUsers,
    totalCustomers,
    totalStaff,
    totalOrders,
    totalRevenue: totalRevenue || 0,
    lowStockCount,
  };
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const conditions = [
      // Admins can't see other admin accounts in this list, only their own.
      { [Op.or]: [{ role: { [Op.ne]: 'admin' } }, { id: req.userId }] },
    ];
    if (role) conditions.push({ role });
    if (search) {
      conditions.push({
        [Op.or]: [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    const users = await User.findAll({
      where: { [Op.and]: conditions },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ users: users.map(serializeUser) });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'staff', phone } = req.body;
    const trimmedName = name?.trim();
    const nameParts = trimmedName?.split(/\s+/) || [];

    if (!trimmedName || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    const user = await User.create({
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || nameParts[0],
      email: email.trim().toLowerCase(),
      password,
      role,
      phone: phone?.trim() || null,
    });

    res.status(201).json({ message: 'User created', user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, name, role, isActive, status, phone, address, city, state, zipCode, country } = req.body;
    const names = name ? name.trim().split(/\s+/) : null;
    await user.update({
      firstName: firstName ?? names?.[0] ?? user.firstName,
      lastName: lastName ?? (names?.slice(1).join(' ') || names?.[0]) ?? user.lastName,
      role: role ?? user.role,
      isActive: isActive !== undefined ? Boolean(isActive) : (status ? status === 'Active' : user.isActive),
      phone: phone ?? user.phone,
      address: address ?? user.address,
      city: city ?? user.city,
      state: state ?? user.state,
      zipCode: zipCode ?? user.zipCode,
      country: country ?? user.country,
    });

    res.status(200).json({ message: 'User updated', user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.id === req.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await user.destroy();
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

export const requestReport = async (req, res, next) => {
  try {
    const reportType = req.body.reportType || 'summary';
    const allowed = ['sales', 'users', 'orders', 'stocks', 'summary'];
    if (!allowed.includes(reportType)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    const range = parseMonthRange(req.body);
    if (range === null) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const data = await buildReportData(reportType, range);
    const titles = {
      sales: 'Sales Report',
      users: 'User List Report',
      orders: 'Orders Report',
      stocks: 'Stocks Report',
      summary: 'System Summary Report',
    };

    const report = await Report.create({
      requestedBy: req.userId,
      reportType,
      title: range && ['sales', 'orders', 'summary'].includes(reportType)
        ? `${titles[reportType]} (${req.body.from} to ${req.body.to})`
        : titles[reportType],
      data,
    });

    res.status(201).json({
      message: 'Report generated',
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    // The list leaves out each report's (possibly large) data; fetch one by id for that
    const reports = await Report.findAll({
      attributes: { exclude: ['data'] },
      include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }],
    });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json({ report });
  } catch (error) {
    next(error);
  }
};
