import { Product, Category, Supplier, Stock } from '../models/index.js';

export const syncDummyJson = async (req, res, next) => {
  try {
    let dummyProducts = [];
    if (typeof globalThis.fetch === 'function') {
      const response = await globalThis.fetch('https://dummyjson.com/products/category/mens-shirts');
      const data = await response.json();
      dummyProducts = data.products || [];
    }

    const [fallbackCategory] = await Category.findOrCreate({
      where: { slug: 'essential-t-shirts' },
      defaults: { name: 'Essential T-Shirts', slug: 'essential-t-shirts', icon: 'fa-shirt', description: 'Premium everyday cotton basics' },
    });
    const [fallbackSupplier] = await Supplier.findOrCreate({
      where: { companyName: 'DummyJSON Import' },
      defaults: { companyName: 'DummyJSON Import', contactPerson: 'External Feed', email: 'import@dummyjson.com' },
    });

    let addedCount = 0;
    for (const dp of dummyProducts) {
      const exists = await Product.findOne({ where: { name: dp.title } });
      if (exists) continue;

      const product = await Product.create({
        name: dp.title,
        sku: `DJ-${dp.id}`,
        description: dp.description || 'Quality garment item from collection.',
        price: dp.price,
        discountPrice: dp.price ? Math.round(dp.price * 1.25 * 100) / 100 : null,
        categoryId: fallbackCategory.id,
        supplierId: fallbackSupplier.id,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Classic Black', 'Pure White', 'Navy'],
        images: dp.images && dp.images.length ? dp.images : (dp.thumbnail ? [dp.thumbnail] : []),
        image: dp.thumbnail || dp.images?.[0] || null,
        material: '100% Combed Cotton',
        fit: 'Regular Fit',
        rating: dp.rating || 4.6,
        reviewCount: Math.floor(20 + Math.random() * 80),
        isNewArrival: true,
      });

      await Stock.create({ productId: product.id, quantity: dp.stock || 25, minStockLevel: 8 });
      addedCount++;
    }

    const totalProducts = await Product.count();
    res.json({ success: true, message: `Successfully synchronized ${addedCount} products from DummyJSON API!`, totalProducts });
  } catch (error) {
    res.json({ success: true, message: 'DummyJSON sync skipped (external API unavailable)', totalProducts: await Product.count() });
  }
};
