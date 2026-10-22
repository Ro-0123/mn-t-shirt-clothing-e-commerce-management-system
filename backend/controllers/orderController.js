import { Op } from 'sequelize';
import { Order, OrderItem, Product, Stock, Cart, Delivery, User, Payment } from '../models/index.js';
import sequelize from '../config/database.js';
import { parseJsonArray } from './productController.js';
import { checkKhqrPayment } from '../utils/khqr.js';
import { checkPaywayTransaction, isPaywayConfigured } from '../utils/payway.js';

// Payment methods that are already paid by the time the order is created --
// gateway payments are verified near the top of createOrder, and store credit
// is deducted in the same transaction that creates the order.
// Flat delivery fee charged per order, whichever courier is chosen at checkout.
// Keep in sync with DELIVERY_FEE in src/views/customer/Checkout.vue.
const DELIVERY_FEE = 0; // TEMP for testing -- normally 2

const VERIFIED_PAYMENT_METHODS =['bank_transfer', 'payway_card', 'payway_qr', 'store_credit'];

// Methods a customer can choose at checkout. Cash on delivery is no longer
// offered; it stays in PAYMENT_METHOD_TO_FRONTEND so old orders still display.
const PAYMENT_METHOD_TO_BACKEND = {
  ABA_QR: 'bank_transfer',
  PAYWAY_CARD: 'payway_card',
  PAYWAY_QR: 'payway_qr',
  STORE_CREDIT: 'store_credit',
  PAYPAL: 'paypal',
};
const PAYMENT_METHOD_TO_FRONTEND = {
  bank_transfer: 'ABA_QR',
  payway_card: 'PAYWAY_CARD',
  payway_qr: 'PAYWAY_QR',
  cash_on_delivery: 'CASH_ON_DELIVERY',
  paypal: 'PAYPAL',
  store_credit: 'STORE_CREDIT',
};
const PAYMENT_STATUS_TO_FRONTEND = {
  pending: 'Pending',
  completed: 'Paid',
  failed: 'Failed',
  refunded: 'Failed',
};
const ORDER_STATUS_TO_BACKEND = {
  Pending: 'pending',
  Processing: 'processing',
  Shipped: 'shipped',
  Delivered: 'delivered',
  Cancelled: 'cancelled',
};
const ORDER_STATUS_TO_FRONTEND = {
  pending: 'Pending',
  confirmed: 'Processing',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

class InsufficientCreditError extends Error {}

const orderInclude = [
  { model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
  { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'images', 'image'] }] },
  { model: Delivery },
];

export const serializeOrder = (order) => {
  const o = order.toJSON ? order.toJSON() : order;
  const customerName = o.User ? `${o.User.firstName} ${o.User.lastName}`.trim() : 'Valued Customer';
  const createdAt = o.createdAt;
  const estimatedDelivery = o.deliveryDate
    || (createdAt ? new Date(new Date(createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null);

  return {
    id: o.orderNumber,
    dbId: o.id,
    customerName,
    customerEmail: o.User?.email || '',
    customerPhone: o.User?.phone || '',
    shippingAddress: o.shippingAddress,
    items: (o.OrderItems || []).map((item) => ({
      productId: item.productId,
      name: item.Product?.name || 'Product',
      price: Number(item.price),
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image: parseJsonArray(item.Product?.images)[0] || item.Product?.image || '',
    })),
    subtotal: Number(o.totalAmount),
    shippingFee: Number(o.shippingCost || 0),
    total: Number(o.finalAmount),
    storeCreditUsed: Number(o.storeCreditUsed || 0),
    amountPaid: Math.round((Number(o.finalAmount) - Number(o.storeCreditUsed || 0)) * 100) / 100,
    paymentMethod: PAYMENT_METHOD_TO_FRONTEND[o.paymentMethod] || 'CASH_ON_DELIVERY',
    paymentStatus: PAYMENT_STATUS_TO_FRONTEND[o.paymentStatus] || 'Pending',
    orderStatus: ORDER_STATUS_TO_FRONTEND[o.status] || 'Pending',
    trackingNumber: o.trackingNumber || o.Delivery?.trackingNumber || '',
    carrier: o.Delivery?.courierName || 'MN Express Dispatch',
    createdAt,
    estimatedDelivery,
    notes: o.notes || '',
    cancelReason: o.cancelReason || '',
  };
};

const findOrderByIdentifier = (identifier, extraInclude = orderInclude) => {
  const numericId = /^\d+$/.test(String(identifier)) ? Number(identifier) : -1;
  return Order.findOne({
    where: { [Op.or]: [{ id: numericId }, { orderNumber: identifier }, { trackingNumber: identifier }] },
    include: extraInclude,
  });
};

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes, courierName, khqrMd5, paywayTranId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    let subtotal = 0;
    const orderItems = [];

    // The same product can be in the cart more than once (different size or
    // colour), and they all come out of one stock count -- check the total.
    const qtyByProduct = {};
    for (const item of items) {
      qtyByProduct[item.productId] = (qtyByProduct[item.productId] || 0) + Number(item.quantity);
    }

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { include: [Stock] });
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      const availableQty = product.Stock?.quantity ?? 0;
      if (availableQty < qtyByProduct[item.productId]) {
        return res.status(400).json({ message: `Only ${availableQty} left in stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color,
        totalPrice: itemTotal,
      });
    }

    const shippingFee = DELIVERY_FEE;
    const finalAmount = Math.round((subtotal + shippingFee) * 100) / 100;

    // Store credit is applied automatically: it covers as much of the order as
    // it can, and only the remainder (amountDue) goes through a payment gateway.
    const customer = await User.findByPk(req.userId);
    const storeCreditUsed = Math.min(Number(customer?.storeCredit || 0), finalAmount);
    const amountDue = Math.round((finalAmount - storeCreditUsed) * 100) / 100;

    // Fully covered by credit -> no gateway at all, whatever the client picked
    const backendPaymentMethod = amountDue === 0 ? 'store_credit' : PAYMENT_METHOD_TO_BACKEND[paymentMethod];
    if (!backendPaymentMethod || (backendPaymentMethod === 'store_credit' && amountDue > 0)) {
      return res.status(400).json({ message: 'Please choose a valid payment method.' });
    }

    // ABA Pay / KHQR orders must be verifiably paid BEFORE the order is created.
    // We re-check with Bakong ourselves rather than trusting the client's claim,
    // including that the amount paid covers what's left after store credit.
    if (backendPaymentMethod === 'bank_transfer') {
      if (!khqrMd5) {
        return res.status(400).json({ message: 'Please scan the KHQR code and complete payment before placing your order.' });
      }
      const paymentResult = await checkKhqrPayment(khqrMd5);
      if (!paymentResult.paid) {
        return res.status(400).json({ message: 'Payment has not been completed yet. Please scan the KHQR code and complete payment before placing your order.' });
      }
      if (Number(paymentResult.amount) + 0.005 < amountDue) {
        return res.status(400).json({ message: `The amount paid ($${Number(paymentResult.amount).toFixed(2)}) is less than the $${amountDue.toFixed(2)} due. Please contact support.` });
      }
    }

    // ABA PayWay (card or PayWay's own QR) orders must likewise be verifiably
    // paid BEFORE the order is created -- we re-check with PayWay ourselves
    // rather than trusting the client's claim, same as the KHQR gate above.
    if (backendPaymentMethod === 'payway_card' || backendPaymentMethod === 'payway_qr') {
      if (!isPaywayConfigured()) {
        return res.status(400).json({ message: 'ABA PayWay is not available yet. Please pay with KHQR.' });
      }
      if (!paywayTranId) {
        return res.status(400).json({ message: 'Please complete payment before placing your order.' });
      }
      const paymentResult = await checkPaywayTransaction(paywayTranId);
      if (!paymentResult.paid) {
        return res.status(400).json({ message: 'Payment has not been completed yet. Please complete payment before placing your order.' });
      }
      if (paymentResult.amount + 0.005 < amountDue) {
        return res.status(400).json({ message: `The amount paid ($${paymentResult.amount.toFixed(2)}) is less than the $${amountDue.toFixed(2)} due. Please contact support.` });
      }
    }

    // PayPal has no real payment gateway wired up yet, so there is no way to
    // verify it actually succeeded. Never let an order through on an
    // unverifiable payment claim.
    if (backendPaymentMethod === 'paypal') {
      return res.status(400).json({ message: 'This payment method is not available yet. Please pay with KHQR or ABA PayWay.' });
    }

    const orderNumber = `MN-ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

    const COURIER_TRACKING_PREFIX = {
      'MN Express Dispatch': 'MN-EXP',
      'J&T Express Partner': 'J&T-EXP',
      'VET Express Dispatch': 'VET-EXP',
    };
    const trackingPrefix = COURIER_TRACKING_PREFIX[courierName] || 'MN-EXP';

    // Everything below runs in one transaction so an order can never be created
    // without its store credit being deducted (or vice versa).
    let order;
    let remainingStoreCredit;
    try {
      order = await sequelize.transaction(async (t) => {
        // Row lock stops two simultaneous checkouts spending the same credit
        const user = await User.findByPk(req.userId, { transaction: t, lock: t.LOCK.UPDATE });
        const balance = Number(user?.storeCredit || 0);
        if (balance + 0.005 < storeCreditUsed) {
          throw new InsufficientCreditError('Your store credit balance changed during checkout. Please review your order and try again.');
        }
        remainingStoreCredit = Math.round((balance - storeCreditUsed) * 100) / 100;
        if (storeCreditUsed > 0) {
          await user.update({ storeCredit: remainingStoreCredit }, { transaction: t });
        }

        const created = await Order.create({
          orderNumber,
          userId: req.userId,
          totalAmount: subtotal,
          shippingCost: shippingFee,
          finalAmount,
          storeCreditUsed,
          paymentMethod: backendPaymentMethod,
          shippingAddress,
          notes,
          // Gateway payments were verified above and store credit was just
          // deducted, so every accepted method is confirmed/completed immediately.
          status: VERIFIED_PAYMENT_METHODS.includes(backendPaymentMethod) ? 'confirmed' : 'pending',
          paymentStatus: VERIFIED_PAYMENT_METHODS.includes(backendPaymentMethod) ? 'completed' : 'pending',
          trackingNumber: `${trackingPrefix}-${Math.floor(100000 + Math.random() * 900000)}`,
          khqrMd5: backendPaymentMethod === 'bank_transfer' ? khqrMd5 : undefined,
          paywayTranId: (backendPaymentMethod === 'payway_card' || backendPaymentMethod === 'payway_qr') ? paywayTranId : undefined,
        }, { transaction: t });

        // Record the money received in the payments table: one row for the
        // store credit part and one for the gateway part (either can be 0).
        if (VERIFIED_PAYMENT_METHODS.includes(backendPaymentMethod)) {
          const paidAt = new Date();
          if (storeCreditUsed > 0) {
            await Payment.create({
              orderId: created.id,
              userId: req.userId,
              amount: storeCreditUsed,
              paymentMethod: 'store_credit',
              status: 'completed',
              paidAt,
            }, { transaction: t });
          }
          if (amountDue > 0) {
            await Payment.create({
              orderId: created.id,
              userId: req.userId,
              amount: amountDue,
              paymentMethod: backendPaymentMethod,
              transactionId: backendPaymentMethod === 'bank_transfer' ? khqrMd5 : paywayTranId,
              status: 'completed',
              paidAt,
            }, { transaction: t });
          }
        }

        for (const item of orderItems) {
          await OrderItem.create({ ...item, orderId: created.id }, { transaction: t });

          // Row lock so two checkouts at the same moment can't both take the last items
          const stock = await Stock.findOne({ where: { productId: item.productId }, transaction: t, lock: t.LOCK.UPDATE });
          if (stock) {
            await stock.update({ quantity: Math.max(0, stock.quantity - item.quantity) }, { transaction: t });
          }
        }

        await Delivery.create({
          orderId: created.id,
          trackingNumber: created.trackingNumber,
          courierName: courierName || 'MN Express Dispatch',
          shippingAddress,
          status: 'pending',
        }, { transaction: t });

        const cart = await Cart.findOne({ where: { userId: req.userId }, transaction: t });
        if (cart) {
          await cart.update({ items: [], totalItems: 0, totalPrice: 0 }, { transaction: t });
        }

        return created;
      });
    } catch (err) {
      if (err instanceof InsufficientCreditError) {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }

    const fullOrder = await findOrderByIdentifier(order.orderNumber);
    res.status(201).json({
      message: 'Order created successfully',
      order: serializeOrder(fullOrder),
      // The customer's balance after this order, so the client can update what it shows
      storeCredit: remainingStoreCredit,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const where = req.userRole === 'customer' ? { userId: req.userId } : {};

    const orders = await Order.findAll({
      where,
      include: orderInclude,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ orders: orders.map(serializeOrder) });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.userId && !['admin', 'staff'].includes(req.userRole)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.status(200).json(serializeOrder(order));
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, status, carrier, trackingNumber } = req.body;

    const order = await findOrderByIdentifier(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const nextStatus = ORDER_STATUS_TO_BACKEND[orderStatus] || status;
    const nextPaymentStatus = paymentStatus === 'Paid' ? 'completed'
      : paymentStatus === 'Failed' ? 'failed'
      : paymentStatus === 'Pending' ? 'pending'
      : undefined;

    await order.update({
      status: nextStatus || order.status,
      paymentStatus: nextPaymentStatus || order.paymentStatus,
      trackingNumber: trackingNumber || order.trackingNumber,
    });

    if (order.Delivery && nextStatus) {
      const deliveryStatusMap = { shipped: 'shipped', delivered: 'delivered', cancelled: 'returned' };
      const deliveryUpdates = {};
      if (deliveryStatusMap[nextStatus]) deliveryUpdates.status = deliveryStatusMap[nextStatus];
      if (carrier) deliveryUpdates.courierName = carrier;
      if (trackingNumber) deliveryUpdates.trackingNumber = trackingNumber;
      if (nextStatus === 'shipped') deliveryUpdates.shippedAt = new Date();
      if (nextStatus === 'delivered') deliveryUpdates.deliveredAt = new Date();
      if (Object.keys(deliveryUpdates).length) {
        await order.Delivery.update(deliveryUpdates);
      }
    }

    const fullOrder = await findOrderByIdentifier(req.params.id);
    res.status(200).json(serializeOrder(fullOrder));
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { cancelReason } = req.body;
    if (!cancelReason || !cancelReason.trim()) {
      return res.status(400).json({ message: 'A cancellation reason is required' });
    }

    const order = await findOrderByIdentifier(req.params.id, [OrderItem]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.userId && !['admin', 'staff'].includes(req.userRole)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    const result = await sequelize.transaction(async (t) => {
      for (const item of order.OrderItems) {
        const stock = await Stock.findOne({ where: { productId: item.productId }, transaction: t });
        if (stock) {
          await stock.update({ quantity: stock.quantity + item.quantity }, { transaction: t });
        }
      }

      await order.update(
        { status: 'cancelled', cancelReason: cancelReason.trim() },
        { transaction: t }
      );

      // Only money the customer actually paid comes back as store credit --
      // refunding an unpaid order would hand out free credit.
      const user = await User.findByPk(order.userId, { transaction: t, lock: t.LOCK.UPDATE });
      if (order.paymentStatus !== 'completed') {
        return Number(user.storeCredit || 0);
      }
      const newStoreCredit = Number(user.storeCredit || 0) + Number(order.finalAmount);
      await user.update({ storeCredit: newStoreCredit }, { transaction: t });
      await order.update({ paymentStatus: 'refunded' }, { transaction: t });
      await Payment.update(
        { status: 'refunded' },
        { where: { orderId: order.id, status: 'completed' }, transaction: t }
      );

      return newStoreCredit;
    });

    const fullOrder = await findOrderByIdentifier(req.params.id);
    res.status(200).json({
      message: 'Order cancelled successfully',
      order: serializeOrder(fullOrder),
      storeCredit: result,
    });
  } catch (error) {
    next(error);
  }
};
