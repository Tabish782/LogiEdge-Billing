const express = require('express');

const { mapCustomer, mapItem } = require('../utils/mappers');
const {
  parsePositiveNumber,
  validateStatus,
  isValidPanNumber,
  isValidGstNumber,
} = require('../utils/validators');
const { fetchInvoiceDetails, createInvoice } = require('../services/invoiceService');

function createApiRouter(pool) {
  const router = express.Router();

  router.get('/health', async (_req, res) => {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok === 1 });
  });

  router.get('/customers', async (_req, res) => {
    const [rows] = await pool.query(
      `
        SELECT *
        FROM customers
        WHERE customer_code IS NOT NULL
        ORDER BY customer_code ASC, id ASC
      `,
    );
    res.json(rows.map(mapCustomer));
  });

  router.post('/customers', async (req, res) => {
    const { name, address, panNumber, gstNumber, status = 'active' } = req.body;

    if (!name || !address || !panNumber || !validateStatus(status)) {
      return res.status(400).json({ message: 'Please provide valid customer details.' });
    }

    const normalizedPanNumber = panNumber.trim().toUpperCase();
    const normalizedGstNumber = gstNumber?.trim() ? gstNumber.trim().toUpperCase() : null;

    if (!isValidPanNumber(normalizedPanNumber)) {
      return res.status(400).json({
        message: 'PAN number must be in valid format, for example ABCDE1234F.',
      });
    }

    if (normalizedGstNumber && !isValidGstNumber(normalizedGstNumber)) {
      return res.status(400).json({
        message: 'GST number must be in valid format, for example 22ABCDE1234F1Z5.',
      });
    }

    const [result] = await pool.query(
      `
        INSERT INTO customers (customer_name, address, pan_number, gst_number, status)
        VALUES (?, ?, ?, ?, ?)
      `,
      [name.trim(), address.trim(), normalizedPanNumber, normalizedGstNumber, status],
    );

    const [[row]] = await pool.query('SELECT * FROM customers WHERE id = ?', [
      result.insertId,
    ]);

    res.status(201).json(mapCustomer(row));
  });

  router.put('/customers/:id', async (req, res) => {
    const customerId = Number(req.params.id);
    const { name, address, panNumber, gstNumber, status = 'active' } = req.body;

    if (
      !Number.isInteger(customerId) ||
      !name ||
      !address ||
      !panNumber ||
      !validateStatus(status)
    ) {
      return res.status(400).json({ message: 'Please provide valid customer details.' });
    }

    const normalizedPanNumber = panNumber.trim().toUpperCase();
    const normalizedGstNumber = gstNumber?.trim() ? gstNumber.trim().toUpperCase() : null;

    if (!isValidPanNumber(normalizedPanNumber)) {
      return res.status(400).json({
        message: 'PAN number must be in valid format, for example ABCDE1234F.',
      });
    }

    if (normalizedGstNumber && !isValidGstNumber(normalizedGstNumber)) {
      return res.status(400).json({
        message: 'GST number must be in valid format, for example 22ABCDE1234F1Z5.',
      });
    }

    const [result] = await pool.query(
      `
        UPDATE customers
        SET customer_name = ?, address = ?, pan_number = ?, gst_number = ?, status = ?
        WHERE id = ?
      `,
      [name.trim(), address.trim(), normalizedPanNumber, normalizedGstNumber, status, customerId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const [[row]] = await pool.query('SELECT * FROM customers WHERE id = ?', [customerId]);
    res.json(mapCustomer(row));
  });

  router.delete('/customers/:id', async (req, res) => {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId)) {
      return res.status(400).json({ message: 'Invalid customer id.' });
    }

    const [[usage]] = await pool.query(
      'SELECT COUNT(*) AS total FROM invoices WHERE customer_id = ?',
      [customerId],
    );

    if (usage.total > 0) {
      return res.status(400).json({
        message: 'Customer is already used in invoices and cannot be deleted.',
      });
    }

    const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [customerId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.json({ message: 'Customer deleted successfully.' });
  });

  router.get('/items', async (_req, res) => {
    const [rows] = await pool.query(
      `
        SELECT *
        FROM items
        WHERE item_code IS NOT NULL
        ORDER BY item_code ASC, id ASC
      `,
    );
    res.json(rows.map(mapItem));
  });

  router.post('/items', async (req, res) => {
    const { name, unitPrice, status = 'active' } = req.body;
    const parsedPrice = parsePositiveNumber(unitPrice);

    if (!name || !parsedPrice || !validateStatus(status)) {
      return res.status(400).json({ message: 'Please provide valid item details.' });
    }

    const [result] = await pool.query(
      'INSERT INTO items (item_name, unit_price, status) VALUES (?, ?, ?)',
      [name.trim(), parsedPrice, status],
    );

    const [[row]] = await pool.query('SELECT * FROM items WHERE id = ?', [
      result.insertId,
    ]);

    res.status(201).json(mapItem(row));
  });

  router.put('/items/:id', async (req, res) => {
    const itemId = Number(req.params.id);
    const { name, unitPrice, status = 'active' } = req.body;
    const parsedPrice = parsePositiveNumber(unitPrice);

    if (!Number.isInteger(itemId) || !name || !parsedPrice || !validateStatus(status)) {
      return res.status(400).json({ message: 'Please provide valid item details.' });
    }

    const [result] = await pool.query(
      `
        UPDATE items
        SET item_name = ?, unit_price = ?, status = ?
        WHERE id = ?
      `,
      [name.trim(), parsedPrice, status, itemId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    const [[row]] = await pool.query('SELECT * FROM items WHERE id = ?', [itemId]);
    res.json(mapItem(row));
  });

  router.delete('/items/:id', async (req, res) => {
    const itemId = Number(req.params.id);

    if (!Number.isInteger(itemId)) {
      return res.status(400).json({ message: 'Invalid item id.' });
    }

    const [[usage]] = await pool.query(
      'SELECT COUNT(*) AS total FROM invoice_items WHERE item_id = ?',
      [itemId],
    );

    if (usage.total > 0) {
      return res.status(400).json({
        message: 'Item is already used in invoices and cannot be deleted.',
      });
    }

    const [result] = await pool.query('DELETE FROM items WHERE id = ?', [itemId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.json({ message: 'Item deleted successfully.' });
  });

  router.get('/invoices', async (req, res) => {
    const searchTerm = (req.query.search || '').trim();
    const searchValue = searchTerm ? `%${searchTerm}%` : '%';

    const [rows] = await pool.query(
      `
        SELECT
          i.id,
          i.invoice_code,
          i.subtotal_amount,
          i.gst_amount,
          i.total_amount,
          i.created_at,
          c.customer_name,
          GROUP_CONCAT(it.item_name ORDER BY it.item_name SEPARATOR ', ') AS item_names
        FROM invoices i
        INNER JOIN customers c ON c.id = i.customer_id
        LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
        LEFT JOIN items it ON it.id = ii.item_id
        WHERE i.invoice_code LIKE ?
        GROUP BY i.id, i.invoice_code, i.subtotal_amount, i.gst_amount, i.total_amount, i.created_at, c.customer_name
        ORDER BY i.created_at DESC, i.id DESC
      `,
      [searchValue],
    );

    res.json(
      rows.map((row) => ({
        id: row.id,
        invoiceCode: row.invoice_code,
        customerName: row.customer_name,
        itemNames: row.item_names || '',
        subtotalAmount: Number(row.subtotal_amount || 0),
        gstAmount: Number(row.gst_amount || 0),
        amount: Number(row.total_amount),
        createdAt: row.created_at,
      })),
    );
  });

  router.get('/invoices/:id', async (req, res) => {
    const invoice = await fetchInvoiceDetails(pool, req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    res.json(invoice);
  });

  router.post('/invoices', async (req, res) => {
    const { customerId, items } = req.body;
    const parsedCustomerId = Number(customerId);

    if (!Number.isInteger(parsedCustomerId) || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: 'Please choose a customer and at least one item.' });
    }

    try {
      const result = await createInvoice(pool, parsedCustomerId, items);
      res.status(result.status).json(result.body);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Could not create invoice.' });
    }
  });

  return router;
}

module.exports = {
  createApiRouter,
};
