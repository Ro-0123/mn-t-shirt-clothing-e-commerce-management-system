import { StoreInfo } from '../models/index.js';

const serialize = (info) => {
  const s = info.toJSON ? info.toJSON() : info;
  return {
    name: s.name,
    email: s.email,
    phone: s.phone,
    address: s.address,
    returnPolicy: s.returnPolicy,
    currency: s.currency,
    freeShippingThreshold: Number(s.freeShippingThreshold),
    standardShippingFee: Number(s.standardShippingFee),
    taxRate: Number(s.taxRate),
  };
};

export const getStoreInfo = async (req, res, next) => {
  try {
    const [info] = await StoreInfo.findOrCreate({ where: { id: 1 }, defaults: {} });
    res.status(200).json(serialize(info));
  } catch (error) {
    next(error);
  }
};

export const updateStoreInfo = async (req, res, next) => {
  try {
    const [info] = await StoreInfo.findOrCreate({ where: { id: 1 }, defaults: {} });
    const { name, email, phone, address, returnPolicy, freeShippingThreshold, standardShippingFee, taxRate } = req.body;
    await info.update({
      name: name ?? info.name,
      email: email ?? info.email,
      phone: phone ?? info.phone,
      address: address ?? info.address,
      returnPolicy: returnPolicy ?? info.returnPolicy,
      freeShippingThreshold: freeShippingThreshold ?? info.freeShippingThreshold,
      standardShippingFee: standardShippingFee ?? info.standardShippingFee,
      taxRate: taxRate ?? info.taxRate,
    });
    res.status(200).json(serialize(info));
  } catch (error) {
    next(error);
  }
};
