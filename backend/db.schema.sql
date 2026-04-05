CREATE DATABASE IF NOT EXISTS logiedge_billing
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE logiedge_billing;

-- Customers

CREATE TABLE IF NOT EXISTS customers (
  id INT NOT NULL AUTO_INCREMENT,
  customer_code VARCHAR(20) NULL,
  customer_name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  pan_number VARCHAR(20) NOT NULL,
  gst_number VARCHAR(30) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_customer_code (customer_code),
  INDEX idx_customers_status (status),
  INDEX idx_customers_name (customer_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Items

CREATE TABLE IF NOT EXISTS items (
  id INT NOT NULL AUTO_INCREMENT,
  item_code VARCHAR(20) NULL,
  item_name VARCHAR(255) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_items_item_code (item_code),
  INDEX idx_items_status (status),
  INDEX idx_items_name (item_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Invoices

CREATE TABLE IF NOT EXISTS invoices (
  id INT NOT NULL AUTO_INCREMENT,
  invoice_code VARCHAR(24) NOT NULL,
  customer_id INT NOT NULL,
  subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  gst_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invoices_invoice_code (invoice_code),
  INDEX idx_invoices_customer_id (customer_id),
  INDEX idx_invoices_created_at (created_at),
  CONSTRAINT fk_invoices_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Invoice Items

CREATE TABLE IF NOT EXISTS invoice_items (
  id INT NOT NULL AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_invoice_items_invoice_id (invoice_id),
  INDEX idx_invoice_items_item_id (item_id),
  CONSTRAINT fk_invoice_items_invoice
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_invoice_items_item
    FOREIGN KEY (item_id) REFERENCES items(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Seed Master Data

INSERT INTO customers (
  customer_code,
  customer_name,
  address,
  pan_number,
  gst_number,
  status
)
SELECT * FROM (
  SELECT 'C00001', 'Gupta Enterprize Pvt. Ltd.', 'Gurgaon, Haryana', 'BCNSG1234H', '06BCNSG1234H1Z5', 'active'
  UNION ALL
  SELECT 'C00002', 'Mahesh Industries Pvt. Ltd.', 'Delhi, Delhi', 'AMNSM1234U', '07AMNSM1234U1Z5', 'active'
  UNION ALL
  SELECT 'C00003', 'Omkar and Brothers Pvt. Ltd.', 'Uttrakhand, Uttar Pradesh', 'CNBSO1234S', '05CNBSO1234S1Z5', 'inactive'
  UNION ALL
  SELECT 'C00004', 'Bhuwan Infotech.', 'Alwar, Rajasthan', 'CMNSB1234A', '08CMNSB1234A1Z5', 'active'
  UNION ALL
  SELECT 'C00005', 'Swastik Software Pvt. Ltd.', 'Gurgaon, Haryana', 'AGBCS1234B', '06AGBCS1234B1Z5', 'active'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM customers);

INSERT INTO items (
  item_code,
  item_name,
  unit_price,
  status
)
SELECT * FROM (
  SELECT 'IT00001', 'Laptop', 85000.00, 'active'
  UNION ALL
  SELECT 'IT00002', 'LED Monitor', 13450.00, 'active'
  UNION ALL
  SELECT 'IT00003', 'Pen Drive', 980.00, 'active'
  UNION ALL
  SELECT 'IT00004', 'Mobile', 18900.00, 'active'
  UNION ALL
  SELECT 'IT00005', 'Headphone', 2350.00, 'inactive'
  UNION ALL
  SELECT 'IT00006', 'Bagpack', 1200.00, 'active'
  UNION ALL
  SELECT 'IT00007', 'Powerbank', 1400.00, 'active'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM items);
