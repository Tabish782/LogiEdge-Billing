const { seedCustomers, seedItems } = require('../data/masterData');

async function ensureColumn(pool, tableName, columnName, definition) {
  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName],
  );

  if (rows[0].total === 0) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function syncCustomersFromMasterData(pool) {
  const [existingRows] = await pool.query('SELECT id, customer_code FROM customers');
  const existingByCode = new Map(
    existingRows.filter((row) => row.customer_code).map((row) => [row.customer_code, row.id]),
  );

  for (const customer of seedCustomers) {
    const existingId = existingByCode.get(customer.customer_code);

    if (existingId) {
      await pool.query(
        `
          UPDATE customers
          SET customer_name = ?, address = ?, pan_number = ?, gst_number = ?, status = ?
          WHERE id = ?
        `,
        [
          customer.customer_name,
          customer.address,
          customer.pan_number,
          customer.gst_number,
          customer.status,
          existingId,
        ],
      );
    } else {
      await pool.query(
        `
          INSERT INTO customers (
            customer_code,
            customer_name,
            address,
            pan_number,
            gst_number,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          customer.customer_code,
          customer.customer_name,
          customer.address,
          customer.pan_number,
          customer.gst_number,
          customer.status,
        ],
      );
    }
  }
}

async function syncItemsFromMasterData(pool) {
  const [existingRows] = await pool.query('SELECT id, item_code FROM items');
  const existingByCode = new Map(
    existingRows.filter((row) => row.item_code).map((row) => [row.item_code, row.id]),
  );

  for (const item of seedItems) {
    const existingId = existingByCode.get(item.item_code);

    if (existingId) {
      await pool.query(
        `
          UPDATE items
          SET item_name = ?, unit_price = ?, status = ?
          WHERE id = ?
        `,
        [item.item_name, item.unit_price, item.status, existingId],
      );
    } else {
      await pool.query(
        `
          INSERT INTO items (item_code, item_name, unit_price, status)
          VALUES (?, ?, ?, ?)
        `,
        [item.item_code, item.item_name, item.unit_price, item.status],
      );
    }
  }
}

async function initializeDatabase(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT PRIMARY KEY AUTO_INCREMENT,
      customer_code VARCHAR(20) NULL,
      customer_name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      pan_number VARCHAR(20) NOT NULL,
      gst_number VARCHAR(30) NULL,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      item_code VARCHAR(20) NULL,
      item_name VARCHAR(255) NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT PRIMARY KEY AUTO_INCREMENT,
      invoice_code VARCHAR(24) UNIQUE,
      customer_id INT NOT NULL,
      subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
      gst_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_invoice_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON DELETE RESTRICT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      invoice_id INT NOT NULL,
      item_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      line_total DECIMAL(12, 2) NOT NULL,
      CONSTRAINT fk_invoice_item_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_invoice_item_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE RESTRICT
    )
  `);

  await pool.query(`
    ALTER TABLE customers
    MODIFY COLUMN gst_number VARCHAR(30) NULL
  `);

  await ensureColumn(pool, 'customers', 'customer_code', 'VARCHAR(20) NULL');
  await ensureColumn(pool, 'items', 'item_code', 'VARCHAR(20) NULL');
  await ensureColumn(pool, 'invoices', 'subtotal_amount', 'DECIMAL(12, 2) NOT NULL DEFAULT 0');
  await ensureColumn(pool, 'invoices', 'gst_rate', 'DECIMAL(5, 2) NOT NULL DEFAULT 0');
  await ensureColumn(pool, 'invoices', 'gst_amount', 'DECIMAL(12, 2) NOT NULL DEFAULT 0');

  await syncCustomersFromMasterData(pool);
  await syncItemsFromMasterData(pool);
}

module.exports = {
  initializeDatabase,
};
