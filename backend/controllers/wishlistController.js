import { Wishlist, Product, Category, Supplier, Stock } from '../models/index.js';
import { serializeProduct } from './productController.js';

export const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.userId },
      include: [{
        model: Product,
        include: [
          { model: Category, attributes: ['id', 'name', 'slug'] },
          { model: Supplier, attributes: ['id', 'companyName'] },
          { model: Stock, attributes: ['quantity', 'minStockLevel'] },
        ],
      }],
      order: [['addedAt', 'DESC']],
    });
    const wishlistItems = items.filter((item) => item.Product).map((item) => serializeProduct(item.Product));
    res.status(200).json({ wishlistItems });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [item, created] = await Wishlist.findOrCreate({
      where: { userId: req.userId, productId },
      defaults: { userId: req.userId, productId },
    });

    if (!created) {
      return res.status(409).json({ message: 'Product already in wishlist' });
    }

    res.status(201).json({ message: 'Added to wishlist', item });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const item = await Wishlist.findOne({
      where: { userId: req.userId, productId: req.params.productId },
    });
    if (!item) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }
    await item.destroy();
    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
};
