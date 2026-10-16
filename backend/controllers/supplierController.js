import { Supplier } from '../models/index.js';

const serializeSupplier = (supplier) => {
  const s = supplier.toJSON ? supplier.toJSON() : supplier;
  return {
    id: s.id,
    name: s.companyName,
    companyName: s.companyName,
    contactPerson: s.contactPerson,
    email: s.email,
    phone: s.phone,
    address: s.address,
    city: s.city,
    country: s.country,
    productsSupplied: s.productsSupplied || '',
    leadTime: s.leadTime || '',
    isActive: s.isActive,
    notes: s.notes,
  };
};

export const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.findAll({ order: [['companyName', 'ASC']] });
    res.status(200).json({ suppliers: suppliers.map(serializeSupplier) });
  } catch (error) {
    next(error);
  }
};

export const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json({ supplier: serializeSupplier(supplier) });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const { companyName, name, contactPerson, email, phone, address, city, country, notes, productsSupplied, leadTime } = req.body;
    const resolvedName = companyName || name;
    if (!resolvedName) {
      return res.status(400).json({ message: 'Company name is required' });
    }
    const supplier = await Supplier.create({
      companyName: resolvedName, contactPerson, email, phone, address, city, country, notes, productsSupplied, leadTime,
    });
    res.status(201).json(serializeSupplier(supplier));
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    const { name, ...rest } = req.body;
    await supplier.update({ ...rest, companyName: rest.companyName || name || supplier.companyName });
    res.status(200).json(serializeSupplier(supplier));
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    await supplier.destroy();
    res.status(200).json({ message: 'Supplier deleted' });
  } catch (error) {
    next(error);
  }
};
