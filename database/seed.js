/**
 * Seed demo data for MN T-Shirt E-Commerce (XAMPP MySQL)
 * Run: node database/seed.js
 */
import dotenv from 'dotenv';
import sequelize from '../backend/config/database.js';
import {
  User, Category, Supplier, Product, Stock, StoreInfo,
} from '../backend/models/index.js';

dotenv.config();

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const password = 'Password123';

    const [admin] = await User.findOrCreate({
      where: { email: 'admin@mnsystem.com' },
      defaults: {
        firstName: 'System', lastName: 'Admin', email: 'admin@mnsystem.com',
        password, role: 'admin',
      },
    });

    const [staff] = await User.findOrCreate({
      where: { email: 'staff@mnsystem.com' },
      defaults: {
        firstName: 'Store', lastName: 'Staff', email: 'staff@mnsystem.com',
        password, role: 'staff',
      },
    });

    const [customer] = await User.findOrCreate({
      where: { email: 'customer@mnsystem.com' },
      defaults: {
        firstName: 'Demo', lastName: 'Customer', email: 'customer@mnsystem.com',
        password, role: 'customer',
      },
    });

    const categoryDefs = [
      { name: 'Essential T-Shirts', slug: 'essential-t-shirts', icon: 'fa-shirt', description: 'Premium everyday cotton basics for daily comfort' },
      { name: 'Oversized Streetwear', slug: 'oversized-streetwear', icon: 'fa-vest', description: 'Boxy drop-shoulder aesthetic heavyweight tees' },
      { name: 'Graphic & Anime Tees', slug: 'graphic-anime-tees', icon: 'fa-palette', description: 'High-definition screen-printed artistic visuals' },
      { name: 'Vintage & Washed', slug: 'vintage-washed', icon: 'fa-fire', description: 'Acid-washed retro 90s distressed grunge styles' },
      { name: 'Polo & Smart Casual', slug: 'polo-smart-casual', icon: 'fa-user-tie', description: 'Pique knit structured collars for semi-formal vibes' },
      { name: 'Hoodies & Longsleeves', slug: 'hoodies-longsleeves', icon: 'fa-mitten', description: 'Cozy fleece lined pullover layers and thermal tees' },
    ];

    const categories = {};
    for (const def of categoryDefs) {
      const [cat] = await Category.findOrCreate({ where: { name: def.name }, defaults: def });
      categories[def.slug] = cat;
    }

    const supplierDefs = [
      { companyName: 'MN Garments Ltd', contactPerson: 'Sokha Meng', email: 'sokha@mngarments.com', phone: '+855 12 889 900', address: 'Veng Sreng Blvd', city: 'Phnom Penh', country: 'Cambodia', productsSupplied: 'Organic Combed Cotton (280 GSM)', leadTime: '3-5 Business Days' },
      { companyName: 'CottonCraft Mills', contactPerson: 'Ravi Sharma', email: 'orders@cottoncraft.io', phone: '+855 23 445 678', address: 'Industrial Zone 3', city: 'Kandal', country: 'Cambodia', productsSupplied: 'Heavyweight Boxy Fabric', leadTime: '5-7 Business Days' },
      { companyName: 'UrbanScreen Printworks', contactPerson: 'Chan Dara', email: 'dara@urbanscreen.com', phone: '+855 89 223 344', address: 'Toul Kork', city: 'Phnom Penh', country: 'Cambodia', productsSupplied: 'Screen-Printed Graphic Tees', leadTime: '4-6 Business Days' },
      { companyName: 'Apex Fleece & Apparel', contactPerson: 'Elena Rostova', email: 'elena@apexapparel.com', phone: '+855 95 667 889', address: 'Chbar Ampov', city: 'Phnom Penh', country: 'Cambodia', productsSupplied: 'Heavy French Terry Fleece', leadTime: '7-10 Business Days' },
    ];

    const suppliers = [];
    for (const def of supplierDefs) {
      const [sup] = await Supplier.findOrCreate({ where: { companyName: def.companyName }, defaults: def });
      suppliers.push(sup);
    }

    const productDefs = [
      {
        name: 'MN Heavyweight Boxy Tee - Jet Black', sku: 'MN-HVY-001', price: 24.99, discountPrice: 32.00,
        categorySlug: 'oversized-streetwear', supplierIdx: 1,
        sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Jet Black', 'Off White', 'Charcoal'],
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
        description: 'Constructed from 280 GSM combed cotton with dropped shoulders and reinforced double-needle stitching.',
        material: '100% Organic Heavy Combed Cotton (280 GSM)', fit: 'Oversized Boxy Fit',
        rating: 4.9, reviewCount: 142, quantity: 45, minStockLevel: 10,
        isFeatured: true, isNewArrival: false, isBestSeller: true,
      },
      {
        name: 'Cyberpunk Neon Genesis Graphic Tee', sku: 'MN-GRP-002', price: 28.50, discountPrice: 35.00,
        categorySlug: 'graphic-anime-tees', supplierIdx: 2,
        sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Washed Black', 'Vintage Purple'],
        images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80'],
        description: 'High-density screen print featuring futuristic Tokyo cyber aesthetics on a vintage garment-dyed base.',
        material: '100% Ring-Spun Cotton (220 GSM)', fit: 'Relaxed Street Fit',
        rating: 4.8, reviewCount: 89, quantity: 32, minStockLevel: 8,
        isFeatured: true, isNewArrival: true, isBestSeller: true,
      },
      {
        name: 'MN Signature Supima Crewneck - Chalk White', sku: 'MN-ESS-003', price: 19.99, discountPrice: 25.00,
        categorySlug: 'essential-t-shirts', supplierIdx: 0,
        sizes: ['S', 'M', 'L', 'XL'], colors: ['Chalk White', 'Heather Gray', 'Navy Blue'],
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80'],
        description: 'Silky smooth extra-long staple Supima cotton crafted for unrivaled softness and breathability.',
        material: '100% California Supima Cotton (190 GSM)', fit: 'Regular Tailored Fit',
        rating: 4.95, reviewCount: 230, quantity: 75, minStockLevel: 15,
        isFeatured: true, isNewArrival: false, isBestSeller: true,
      },
      {
        name: 'Vintage Acid Washed Eagle Rock Tee', sku: 'MN-VNT-004', price: 29.99, discountPrice: 38.00,
        categorySlug: 'vintage-washed', supplierIdx: 1,
        sizes: ['M', 'L', 'XL', '2XL'], colors: ['Faded Charcoal', 'Washed Olive'],
        images: ['https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80'],
        description: 'Hand-treated enzyme stone wash giving each piece a distinctive retro faded patina.',
        material: '100% Pre-Shrunk Washed Cotton (240 GSM)', fit: 'Relaxed Vintage Fit',
        rating: 4.7, reviewCount: 64, quantity: 18, minStockLevel: 6,
        isFeatured: false, isNewArrival: true, isBestSeller: false,
      },
      {
        name: 'MN Oxford Structured Pique Polo', sku: 'MN-POL-005', price: 34.00, discountPrice: 42.00,
        categorySlug: 'polo-smart-casual', supplierIdx: 0,
        sizes: ['S', 'M', 'L', 'XL'], colors: ['Midnight Navy', 'Forest Green', 'Burgundy'],
        images: ['https://images.unsplash.com/photo-1625910513413-7d52676b92a2?auto=format&fit=crop&w=800&q=80'],
        description: 'Double pique breathable weave featuring mother-of-pearl buttons and a self-fabric collar.',
        material: '95% Combed Cotton, 5% Elastane Pique (230 GSM)', fit: 'Modern Slim Fit',
        rating: 4.85, reviewCount: 98, quantity: 28, minStockLevel: 8,
        isFeatured: false, isNewArrival: false, isBestSeller: true,
      },
      {
        name: 'MN Heavy Fleece 450 GSM Oversized Hoodie', sku: 'MN-HOD-008', price: 54.00, discountPrice: 68.00,
        categorySlug: 'hoodies-longsleeves', supplierIdx: 3,
        sizes: ['M', 'L', 'XL'], colors: ['Vintage Bone', 'Washed Carbon', 'Mocha Brown'],
        images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
        description: 'Heavyweight loopback French terry cloth, double-layered hood, kangaroo pocket, drop-shoulder cut.',
        material: '100% Heavy French Terry Cotton (450 GSM)', fit: 'Boxy Drop-Shoulder Fit',
        rating: 4.98, reviewCount: 175, quantity: 14, minStockLevel: 15,
        isFeatured: true, isNewArrival: false, isBestSeller: true,
      },
    ];

    for (const def of productDefs) {
      const category = categories[def.categorySlug];
      const supplier = suppliers[def.supplierIdx];
      const [product] = await Product.findOrCreate({
        where: { name: def.name },
        defaults: {
          name: def.name,
          sku: def.sku,
          description: def.description,
          price: def.price,
          discountPrice: def.discountPrice,
          categoryId: category.id,
          supplierId: supplier.id,
          sizes: def.sizes,
          colors: def.colors,
          images: def.images,
          image: def.images[0],
          material: def.material,
          fit: def.fit,
          rating: def.rating,
          reviewCount: def.reviewCount,
          isFeatured: def.isFeatured,
          isNewArrival: def.isNewArrival,
          isBestSeller: def.isBestSeller,
        },
      });

      await Stock.findOrCreate({
        where: { productId: product.id },
        defaults: { productId: product.id, quantity: def.quantity, minStockLevel: def.minStockLevel, warehouseLocation: 'Warehouse A' },
      });
    }

    await StoreInfo.findOrCreate({ where: { id: 1 }, defaults: {} });

    console.log('Seed completed successfully!');
    console.log('Demo accounts (password: Password123):');
    console.log('  Admin:    admin@mnsystem.com');
    console.log('  Staff:    staff@mnsystem.com');
    console.log('  Customer: customer@mnsystem.com');
    console.log(`Created users: admin=${admin.id}, staff=${staff.id}, customer=${customer.id}`);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
