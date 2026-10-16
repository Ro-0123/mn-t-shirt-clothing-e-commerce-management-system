import { Delivery, Order, User, OrderItem, Product } from '../models/index.js';

const STATUS_TO_FRONTEND = {
  pending: 'Pending',
  packed: 'Dispatched',
  shipped: 'Dispatched',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  returned: 'Returned',
  failed: 'Failed',
};

const deliveryInclude = [{
  model: Order,
  include: [
    { model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
    { model: OrderItem, include: [Product] },
  ],
}];

const serializeDelivery = (delivery) => {
  const d = delivery.toJSON ? delivery.toJSON() : delivery;
  const order = d.Order;
  const recipientName = order?.User ? `${order.User.firstName} ${order.User.lastName}`.trim() : 'Customer';
  const address = d.shippingAddress || order?.shippingAddress;
  const addressLine = address ? `${address.street || ''}${address.city ? ', ' + address.city : ''}` : '';

  return {
    id: d.id,
    orderId: order?.orderNumber || d.orderId,
    recipient: recipientName,
    recipientPhone: order?.User?.phone || '',
    address: addressLine,
    carrier: d.courierName || 'MN Express Dispatch',
    trackingNumber: d.trackingNumber || '',
    estimatedDelivery: d.shippedAt
      ? new Date(new Date(d.shippedAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : (d.createdAt ? new Date(new Date(d.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : ''),
    status: STATUS_TO_FRONTEND[d.status] || 'Pending',
    driverNotes: d.notes || '',
    dispatchedAt: d.shippedAt,
    deliveredAt: d.deliveredAt,
  };
};

export const getAllDeliveries = async (req, res, next) => {
  try {
    const deliveries = await Delivery.findAll({
      include: deliveryInclude,
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ deliveries: deliveries.map(serializeDelivery) });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id, { include: deliveryInclude });
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.status(200).json({ delivery: serializeDelivery(delivery) });
  } catch (error) {
    next(error);
  }
};

export const createDelivery = async (req, res, next) => {
  try {
    const { orderId, courierName, trackingNumber, shippingAddress, notes } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const existing = await Delivery.findOne({ where: { orderId } });
    if (existing) {
      return res.status(409).json({ message: 'Delivery already exists for this order' });
    }

    const delivery = await Delivery.create({
      orderId,
      courierName,
      trackingNumber,
      shippingAddress: shippingAddress || order.shippingAddress,
      notes,
      status: 'pending',
    });

    const fullDelivery = await Delivery.findByPk(delivery.id, { include: deliveryInclude });
    res.status(201).json(serializeDelivery(fullDelivery));
  } catch (error) {
    next(error);
  }
};

export const updateDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id, { include: [Order] });
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    const { status, courierName, trackingNumber, notes, driverNotes } = req.body;
    const backendStatus = { Pending: 'pending', Dispatched: 'shipped', 'In Transit': 'in_transit', Delivered: 'delivered', Returned: 'returned', Failed: 'failed' }[status] || status;

    const updates = {
      status: backendStatus ?? delivery.status,
      courierName: courierName ?? delivery.courierName,
      trackingNumber: trackingNumber ?? delivery.trackingNumber,
      notes: notes ?? driverNotes ?? delivery.notes,
    };

    if (backendStatus === 'shipped' && !delivery.shippedAt) {
      updates.shippedAt = new Date();
    }
    if (backendStatus === 'delivered' && !delivery.deliveredAt) {
      updates.deliveredAt = new Date();
    }

    await delivery.update(updates);

    if (delivery.Order && backendStatus) {
      const orderStatusMap = {
        shipped: 'shipped',
        in_transit: 'shipped',
        delivered: 'delivered',
      };
      if (orderStatusMap[backendStatus]) {
        await delivery.Order.update({ status: orderStatusMap[backendStatus] });
      }
    }

    const fullDelivery = await Delivery.findByPk(delivery.id, { include: deliveryInclude });
    res.status(200).json(serializeDelivery(fullDelivery));
  } catch (error) {
    next(error);
  }
};
