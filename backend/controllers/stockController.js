import { literal } from 'sequelize';
import { Stock, Product, Category } from '../models/index.js';

export const getAllStocks = async (req, res, next) => {
  try {
    const stocks = await Stock.findAll({
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'isActive'],
        include: [{ model: Category, attributes: ['name'] }],
      }],
      order: [['quantity', 'ASC']],
    });
    res.status(200).json({ stocks });
  } catch (error) {
    next(error);
  }
};

export const getStockByProductId = async (req, res, next) => {
  try {
    const stock = await Stock.findOne({
      where: { productId: req.params.productId },
      include: [Product],
    });
    if (!stock) {
      return res.status(404).json({ message: 'Stock record not found' });
    }
    res.status(200).json({ stock });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { quantity, minStockLevel, warehouseLocation, notes } = req.body;
    const stock = await Stock.findByPk(req.params.id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock record not found' });
    }

    const wasRestocked = quantity !== undefined && quantity > stock.quantity;
    await stock.update({
      quantity: quantity ?? stock.quantity,
      minStockLevel: minStockLevel ?? stock.minStockLevel,
      warehouseLocation: warehouseLocation ?? stock.warehouseLocation,
      notes: notes ?? stock.notes,
      lastRestockedAt: wasRestocked ? new Date() : stock.lastRestockedAt,
    });

    res.status(200).json({ message: 'Stock updated', stock });
  } catch (error) {
    next(error);
  }
};

export const getLowStockItems = async (req, res, next) => {
  try {
    const stocks = await Stock.findAll({
      where: literal('quantity <= minStockLevel'),
      include: [Product],
    });
    res.status(200).json({ lowStockItems: stocks });
  } catch (error) {
    next(error);
  }
};
