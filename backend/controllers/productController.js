import { Op } from 'sequelize';
import { Product, Category, Supplier, Stock } from '../models/index.js';

const toSlug = (name = '') => String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const generateSku = (id) => `MNT-${String(id).padStart(4, '0')}`;

// Sequelize sometimes returns MySQL JSON columns as raw unparsed strings when
// fetched through deeply nested includes (e.g. Order -> OrderItem -> Product),
// even though the same column parses correctly on a top-level query. Parse defensively.
export const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.length) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  return [];
};

export const serializeProduct = (product) => {
  const p = product.toJSON ? product.toJSON() : product;
  const images = parseJsonArray(p.images);
  const sizes = parseJsonArray(p.sizes);
  const colors = parseJsonArray(p.colors);
  const stock = p.Stock?.quantity ?? 0;
  const minStockLevel = p.Stock?.minStockLevel ?? 10;
  const price = Number(p.price || 0);
  const originalPrice = p.discountPrice ? Number(p.discountPrice) : price;
  const discountPercentage = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return {
    id: p.id,
    sku: p.sku || generateSku(p.id),
    name: p.name,
    description: p.description,
    price,
    originalPrice,
    discountPercentage,
    rating: Number(p.rating || 0),
    reviewsCount: Number(p.reviewCount || 0),
    stock,
    minStockLevel,
    categoryId: p.categoryId,
    categoryName: p.Category?.name || '',
    categorySlug: p.Category?.slug || '',
    supplierId: p.supplierId,
    supplierName: p.Supplier?.companyName || '',
    sizes,
    colors,
    images: images.length ? images : (p.image ? [p.image] : []),
    fabric: p.material || '',
    fit: p.fit || '',
    isFeatured: !!p.isFeatured,
    isNewArrival: !!p.isNewArrival,
    isBestSeller: !!p.isBestSeller,
    isActive: p.isActive,
    createdAt: p.createdAt,
  };
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (category) {
      const allCategories = await Category.findAll();
      const cat = allCategories.find((c) => (
        String(c.id) === String(category) ||
        c.slug === category ||
        (!c.slug && toSlug(c.name) === category)
      ));
      where.categoryId = cat ? cat.id : -1;
    }
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'] },
        { model: Supplier, attributes: ['id', 'companyName'] },
        { model: Stock, attributes: ['quantity', 'minStockLevel'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      products: rows.map(serializeProduct),
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'] },
        { model: Supplier, attributes: ['id', 'companyName', 'contactPerson', 'phone'] },
        { model: Stock, attributes: ['quantity', 'minStockLevel', 'warehouseLocation'] },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ product: serializeProduct(product) });
  } catch (error) {
    next(error);
  }
};

const fullyLoadProduct = (id) => Product.findByPk(id, {
  include: [
    { model: Category, attributes: ['id', 'name', 'slug'] },
    { model: Supplier, attributes: ['id', 'companyName'] },
    { model: Stock, attributes: ['quantity', 'minStockLevel'] },
  ],
});

export const uploadProductImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded' });
    }
    const images = files.map((file) => `/uploads/products/${file.filename}`);
    res.status(200).json({ images });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name, description, price, originalPrice, discountPrice, categoryId, supplierId,
      sizes, colors, material, fabric, fit, images, image, sku, quantity, stock,
      minStockLevel, isFeatured, isNewArrival, isBestSeller,
    } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const product = await Product.create({
      name,
      sku: sku || undefined,
      description,
      price,
      discountPrice: discountPrice ?? originalPrice ?? null,
      categoryId,
      supplierId: supplierId || null,
      image: req.file ? req.file.path : (image || images?.[0] || null),
      images: images || (image ? [image] : null),
      sizes,
      colors,
      material: material || fabric,
      fit,
      isFeatured: Boolean(isFeatured),
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
      isBestSeller: Boolean(isBestSeller),
    });

    if (!product.sku) {
      await product.update({ sku: generateSku(product.id) });
    }

    await Stock.create({
      productId: product.id,
      quantity: quantity ?? stock ?? 0,
      minStockLevel: minStockLevel ?? 10,
    });

    const fullProduct = await fullyLoadProduct(product.id);
    res.status(201).json(serializeProduct(fullProduct));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, description, price, originalPrice, discountPrice, categoryId, supplierId,
      sizes, colors, material, fabric, fit, images, image, sku,
      isFeatured, isNewArrival, isBestSeller, isActive,
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.update({
      name: name || product.name,
      sku: sku || product.sku,
      description: description ?? product.description,
      price: price ?? product.price,
      discountPrice: discountPrice ?? originalPrice ?? product.discountPrice,
      categoryId: categoryId || product.categoryId,
      supplierId: supplierId !== undefined ? supplierId : product.supplierId,
      sizes: sizes || product.sizes,
      colors: colors || product.colors,
      material: material || fabric || product.material,
      fit: fit ?? product.fit,
      image: req.file ? req.file.path : (image || images?.[0] || product.image),
      images: images || product.images,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : product.isFeatured,
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : product.isNewArrival,
      isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : product.isBestSeller,
      isActive: isActive !== undefined ? Boolean(isActive) : product.isActive,
    });

    const fullProduct = await fullyLoadProduct(product.id);
    res.status(200).json(serializeProduct(fullProduct));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export { toSlug };
