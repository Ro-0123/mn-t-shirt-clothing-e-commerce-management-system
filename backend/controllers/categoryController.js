import { Category, Product } from '../models/index.js';

const toSlug = (name = '') => String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const serializeCategory = async (category) => {
  const c = category.toJSON ? category.toJSON() : category;
  const itemCount = await Product.count({ where: { categoryId: c.id, isActive: true } });
  return {
    id: c.id,
    name: c.name,
    slug: c.slug || toSlug(c.name),
    description: c.description || '',
    icon: c.icon || 'fa-shirt',
    image: c.image,
    isActive: c.isActive,
    itemCount,
  };
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
    res.status(200).json({ categories: await Promise.all(categories.map(serializeCategory)) });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ category: await serializeCategory(category) });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, icon, slug } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const category = await Category.create({
      name,
      description,
      image,
      icon: icon || 'fa-shirt',
      slug: slug || toSlug(name),
    });
    res.status(201).json(await serializeCategory(category));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const { name, description, image, isActive, icon, slug } = req.body;
    await category.update({
      name: name ?? category.name,
      description: description ?? category.description,
      image: image ?? category.image,
      icon: icon ?? category.icon,
      slug: slug ?? (name ? toSlug(name) : category.slug),
      isActive: isActive ?? category.isActive,
    });
    res.status(200).json(await serializeCategory(category));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.destroy();
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

export { serializeCategory };
