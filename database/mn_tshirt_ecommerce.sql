-- ============================================================
-- MN T-Shirt Clothing E-Commerce Management System
-- Database schema for XAMPP (MySQL / MariaDB)
-- Based on Context Diagram (Level 0 DFD)
--
-- External entities: Staff, Customer, Admin
-- Import via phpMyAdmin: Import > Choose this file > Go
-- Or run: mysql -u root < database/mn_tshirt_ecommerce.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS mn_tshirt_ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mn_tshirt_ecommerce;

-- ------------------------------------------------------------
-- USERS (Customer, Staff, Admin)
-- Flows: Register/Login, Manage Profile, Manage Users (Admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  firstName     VARCHAR(100)  NOT NULL,
  lastName      VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,
  phone         VARCHAR(50),
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  zipCode       VARCHAR(20),
  country       VARCHAR(100),
  role          ENUM('customer', 'staff', 'admin') NOT NULL DEFAULT 'customer',
  isActive      TINYINT(1)    NOT NULL DEFAULT 1,
  profileImage  VARCHAR(500),
  createdAt     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- CATEGORIES (Staff: Manage Categories)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  image       VARCHAR(500),
  isActive    TINYINT(1)   NOT NULL DEFAULT 1,
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- SUPPLIERS (Staff: Manage Suppliers)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  companyName   VARCHAR(200) NOT NULL,
  contactPerson VARCHAR(150),
  email         VARCHAR(255),
  phone         VARCHAR(50),
  address       TEXT,
  city          VARCHAR(100),
  country       VARCHAR(100),
  isActive      TINYINT(1)   NOT NULL DEFAULT 1,
  notes         TEXT,
  createdAt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- PRODUCTS (Staff: Manage Products | Customer: Product Search)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255)   NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2)  NOT NULL,
  discountPrice DECIMAL(10,2),
  categoryId    INT            NOT NULL,
  supplierId    INT,
  image         VARCHAR(500),
  images        JSON,
  sizes         JSON,
  colors        JSON,
  material      VARCHAR(100),
  rating        FLOAT          NOT NULL DEFAULT 0,
  reviewCount   INT            NOT NULL DEFAULT 0,
  isActive      TINYINT(1)     NOT NULL DEFAULT 1,
  createdAt     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (categoryId) REFERENCES categories(id),
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplierId) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- STOCKS (Staff: Manage Stocks)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stocks (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  productId       INT          NOT NULL UNIQUE,
  quantity        INT          NOT NULL DEFAULT 0,
  minStockLevel   INT          NOT NULL DEFAULT 10,
  warehouseLocation VARCHAR(150),
  lastRestockedAt DATETIME,
  notes           TEXT,
  createdAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stocks_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ORDERS (Customer: Place Order | Staff: Manage Orders)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  orderNumber     VARCHAR(50)    NOT NULL UNIQUE,
  userId          INT            NOT NULL,
  totalAmount     DECIMAL(10,2)  NOT NULL,
  tax             DECIMAL(10,2)  NOT NULL DEFAULT 0,
  shippingCost    DECIMAL(10,2)  NOT NULL DEFAULT 0,
  discountAmount  DECIMAL(10,2)  NOT NULL DEFAULT 0,
  finalAmount     DECIMAL(10,2)  NOT NULL,
  storeCreditUsed DECIMAL(10,2)  NOT NULL DEFAULT 0,
  status          ENUM('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  paymentStatus   ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  paymentMethod   ENUM('credit_card','debit_card','paypal','bank_transfer','cash_on_delivery','payway_card','payway_qr','store_credit'),
  shippingAddress JSON           NOT NULL,
  notes           TEXT,
  trackingNumber  VARCHAR(100),
  deliveryDate    DATETIME,
  createdAt       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ORDER ITEMS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  orderId    INT           NOT NULL,
  productId  INT           NOT NULL,
  quantity   INT           NOT NULL,
  price      DECIMAL(10,2) NOT NULL,
  size       VARCHAR(50),
  color      VARCHAR(50),
  totalPrice DECIMAL(10,2) NOT NULL,
  createdAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order   FOREIGN KEY (orderId)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (productId) REFERENCES products(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- DELIVERIES (Staff: Manage Deliveries)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deliveries (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  orderId         INT          NOT NULL UNIQUE,
  status          ENUM('pending','packed','shipped','in_transit','delivered','returned','failed') NOT NULL DEFAULT 'pending',
  courierName     VARCHAR(150),
  trackingNumber  VARCHAR(100),
  shippingAddress JSON,
  shippedAt       DATETIME,
  deliveredAt     DATETIME,
  notes           TEXT,
  createdAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_deliveries_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- PAYMENTS (Customer: Request Payment -> Payment Confirmation)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  orderId         INT           NOT NULL,
  userId          INT           NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  paymentMethod   ENUM('credit_card','debit_card','paypal','bank_transfer','cash_on_delivery') NOT NULL,
  transactionId   VARCHAR(255),
  status          ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  paidAt          DATETIME,
  createdAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_user  FOREIGN KEY (userId)  REFERENCES users(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- CARTS (Customer shopping cart)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  userId     INT           NOT NULL UNIQUE,
  items      JSON          NOT NULL,
  totalItems INT           NOT NULL DEFAULT 0,
  totalPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
  createdAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- REPORTS (Admin: Request Report / Report List)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  requestedBy INT          NOT NULL,
  reportType  ENUM('sales','users','orders','stocks','summary') NOT NULL,
  title       VARCHAR(255) NOT NULL,
  data        JSON         NOT NULL,
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (requestedBy) REFERENCES users(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- WISHLISTS (Customer: Manage Wishlist)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlists (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  userId    INT      NOT NULL,
  productId INT      NOT NULL,
  addedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlist_user_product (userId, productId),
  CONSTRAINT fk_wishlists_user    FOREIGN KEY (userId)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_wishlists_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA (default admin, staff, sample categories)
-- Password for all demo accounts: Password123
-- bcrypt hash below
-- ============================================================
INSERT INTO users (firstName, lastName, email, password, role) VALUES
  ('System', 'Admin', 'admin@mnsystem.com', '$2b$10$FuvZPV2P5NO1PVf4XRo7oOnBt9hBtAxXu0/RiNx4Pavm2Qbkbteaq', 'admin'),
  ('Store', 'Staff', 'staff@mnsystem.com', '$2b$10$FuvZPV2P5NO1PVf4XRo7oOnBt9hBtAxXu0/RiNx4Pavm2Qbkbteaq', 'staff'),
  ('Demo', 'Customer', 'customer@mnsystem.com', '$2b$10$FuvZPV2P5NO1PVf4XRo7oOnBt9hBtAxXu0/RiNx4Pavm2Qbkbteaq', 'customer')
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO categories (name, description) VALUES
  ('T-Shirts', 'Classic and graphic t-shirts'),
  ('Polo Shirts', 'Collared polo shirts'),
  ('Hoodies', 'Comfortable hoodies and sweatshirts'),
  ('Accessories', 'Caps, bags, and accessories')
ON DUPLICATE KEY UPDATE name = name;
