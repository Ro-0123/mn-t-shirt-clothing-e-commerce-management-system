import { Op } from 'sequelize';
import { Payment, Order, User } from '../models/index.js';
import { generateKhqr, checkKhqrPayment } from '../utils/khqr.js';
import { createPaywayPurchase, checkPaywayTransaction, isPaywayConfigured } from '../utils/payway.js';

const findOrderByIdentifier = (identifier) => {
  const numericId = /^\d+$/.test(String(identifier)) ? Number(identifier) : -1;
  return Order.findOne({ where: { [Op.or]: [{ id: numericId }, { orderNumber: identifier }] } });
};

export const generateKhqrCode = async (req, res, next) => {
  try {
    const { amount, billNumber } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }

    const { qr, md5, expiresAt } = generateKhqr({ amount, billNumber });

    if (billNumber && billNumber !== 'PREVIEW') {
      const order = await findOrderByIdentifier(billNumber);
      if (order && order.userId === req.userId) {
        await order.update({ khqrMd5: md5, khqrExpiresAt: expiresAt });
      }
    }

    res.status(200).json({ qr, md5, expiresAt });
  } catch (error) {
    next(error);
  }
};

export const checkKhqrStatus = async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(200).json({ paid: true });
    }
    if (!order.khqrMd5) {
      return res.status(400).json({ message: 'No pending KHQR payment for this order' });
    }
    if (order.khqrExpiresAt && new Date() > new Date(order.khqrExpiresAt)) {
      return res.status(200).json({ paid: false, expired: true, message: 'QR code has expired' });
    }

    const result = await checkKhqrPayment(order.khqrMd5);
    if (result.paid) {
      await order.update({ paymentStatus: 'completed', status: 'confirmed' });
    }

    res.status(200).json({ paid: result.paid });
  } catch (error) {
    next(error);
  }
};

// Checks a KHQR payment by its md5 directly, with no order required yet.
// Used at checkout time so the frontend can confirm payment BEFORE the order
// is created, rather than creating a pending order and hoping it gets paid later.
export const checkKhqrStatusByMd5 = async (req, res, next) => {
  try {
    const result = await checkKhqrPayment(req.params.md5);
    res.status(200).json({ paid: result.paid });
  } catch (error) {
    next(error);
  }
};

// Creates a signed ABA PayWay purchase request and returns PayWay's response
// (a QR image + ABA Mobile deep link, or a hosted redirect for card entry --
// see createPaywayPurchase's comments for what's confirmed vs. not).
// Like the KHQR preview, this runs BEFORE any order exists -- the frontend
// confirms payment via checkPaywayStatusByTranId, then the order is only
// created once that comes back paid.
export const createPaywayPayment = async (req, res, next) => {
  try {
    if (!isPaywayConfigured()) {
      return res.status(503).json({ message: 'ABA PayWay is not configured yet on this server.' });
    }

    const { amount, paymentOption } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }

    const user = await User.findByPk(req.userId);
    const result = await createPaywayPurchase({
      amount,
      paymentOption: paymentOption || '',
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      phone: user?.phone,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Checks a PayWay transaction by its tran_id directly, with no order
// required yet -- same pattern as checkKhqrStatusByMd5.
export const checkPaywayStatusByTranId = async (req, res, next) => {
  try {
    if (!isPaywayConfigured()) {
      return res.status(503).json({ message: 'ABA PayWay is not configured yet on this server.' });
    }
    const result = await checkPaywayTransaction(req.params.tranId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// PayWay calls this (as `return_url`) server-to-server after a payment
// attempt completes. Must be a publicly reachable HTTPS URL whitelisted with
// PayWay's integration team, or the callback silently never arrives.
//
// TODO: this does not yet verify the callback's authenticity -- PayWay's
// refund/callback signature scheme wasn't confirmed in research for this
// integration. Don't treat this payload as trustworthy proof of payment
// until that's implemented; checkPaywayStatusByTranId (server-initiated, so
// its response can't be spoofed by a client) is what order creation
// actually relies on today.
export const paywayCallback = async (req, res) => {
  console.log('Received PayWay callback:', req.body);
  res.sendStatus(200);
};

export const requestPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;
    if (!orderId || !paymentMethod) {
      return res.status(400).json({ message: 'Order ID and payment method are required' });
    }

    const order = await findOrderByIdentifier(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const transactionId = `TXN-${Date.now()}-${order.id}`;
    const payment = await Payment.create({
      orderId: order.id,
      userId: req.userId,
      amount: order.finalAmount,
      paymentMethod,
      transactionId,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Payment request submitted',
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, { include: [Order] });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await payment.update({ status: 'completed', paidAt: new Date() });
    if (payment.Order) {
      await payment.Order.update({ paymentStatus: 'completed', status: 'confirmed' });
    }

    res.status(200).json({
      message: 'Payment confirmed',
      paymentConfirmation: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentByOrder = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      where: { orderId: req.params.orderId },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ payments });
  } catch (error) {
    next(error);
  }
};
