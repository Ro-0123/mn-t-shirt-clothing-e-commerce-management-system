import { Cart, Product } from '../models/index.js';
import { parseJsonArray } from './productController.js';

const getOrCreateCart = async (userId) => {
  const [cart] = await Cart.findOrCreate({ where: { userId }, defaults: { userId, items: [] } });
  return cart;
};

const recalcTotals = (items) => ({
  totalItems: items.reduce((sum, i) => sum + Number(i.quantity || 0), 0),
  totalPrice: Math.round(items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0) * 100) / 100,
});

export const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.userId);
    res.status(200).json(parseJsonArray(cart.items));
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, size, color, quantity, name, price, image } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const cart = await getOrCreateCart(req.userId);
    const items = parseJsonArray(cart.items);

    const resolvedSize = size || 'M';
    const resolvedColor = color || 'Black';
    const existingIdx = items.findIndex(
      (i) => Number(i.productId) === Number(productId) && i.size === resolvedSize && i.color === resolvedColor,
    );

    if (existingIdx !== -1) {
      items[existingIdx] = {
        ...items[existingIdx],
        quantity: Number(items[existingIdx].quantity || 0) + Number(quantity || 1),
        name: name || product.name,
        price: price ?? Number(product.price),
        image: image || product.images?.[0] || product.image || items[existingIdx].image,
      };
    } else {
      items.push({
        productId: Number(productId),
        name: name || product.name,
        price: price ?? Number(product.price),
        quantity: Number(quantity || 1),
        size: resolvedSize,
        color: resolvedColor,
        image: image || product.images?.[0] || product.image || '',
      });
    }

    await cart.update({ items, ...recalcTotals(items) });
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { productId, size, color, quantity } = req.body;
    const cart = await getOrCreateCart(req.userId);
    let items = parseJsonArray(cart.items);

    const idx = items.findIndex(
      (i) => Number(i.productId) === Number(productId) && i.size === size && i.color === color,
    );

    if (idx !== -1) {
      if (Number(quantity) <= 0) {
        items.splice(idx, 1);
      } else {
        items[idx] = { ...items[idx], quantity: Number(quantity) };
      }
    }

    await cart.update({ items, ...recalcTotals(items) });
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { productId, size, color } = req.body;
    const cart = await getOrCreateCart(req.userId);
    const items = parseJsonArray(cart.items).filter(
      (i) => !(Number(i.productId) === Number(productId) && i.size === size && i.color === color),
    );

    await cart.update({ items, ...recalcTotals(items) });
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.userId);
    await cart.update({ items: [], totalItems: 0, totalPrice: 0 });
    res.status(200).json([]);
  } catch (error) {
    next(error);
  }
};
