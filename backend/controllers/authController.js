import { User } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';
import { verifyRecaptcha } from '../utils/recaptcha.js';

const toPublicUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  phone: user.phone,
  address: user.address,
  city: user.city,
  state: user.state,
  zipCode: user.zipCode,
  country: user.country,
  role: user.role,
  profileImage: user.profileImage,
  avatar: user.profileImage,
  isActive: user.isActive,
  storeCredit: Number(user.storeCredit || 0),
});

const splitName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: 'Customer', lastName: 'User' };
  if (parts.length === 1) return { firstName: parts[0], lastName: 'User' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, name, email, password, confirmPassword, phone, recaptchaToken } = req.body;

    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ message: 'Captcha verification failed. Please try again.' });
    }

    const names = firstName && lastName
      ? { firstName, lastName }
      : splitName(name);

    if (!email || !password || !names.firstName) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (phone && !/^\d{9,10}$/.test(phone.trim())) {
      return res.status(400).json({ message: 'Phone number must be 9-10 digits' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      firstName: names.firstName,
      lastName: names.lastName,
      email,
      password,
      phone,
      role: 'customer',
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ message: 'Captcha verification failed. Please try again.' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

export const profile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, city, state, zipCode, country } = req.body;

    if (phone && !/^\d{9,10}$/.test(phone.trim())) {
      return res.status(400).json({ message: 'Phone number must be 9-10 digits' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      address: address || user.address,
      city: city || user.city,
      state: state || user.state,
      zipCode: zipCode || user.zipCode,
      country: country || user.country,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ profileImage: `/uploads/avatars/${req.file.filename}` });

    res.status(200).json({
      message: 'Profile photo updated successfully',
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
};
