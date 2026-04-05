const { isGstRegistered } = require('../utils/validators');

async function fetchInvoiceDetails(pool, invoiceId) {
  const [[invoiceRow]] = await pool.query(
    `
      SELECT
        i.id,
        i.invoice_code,
        i.subtotal_amount,
        i.gst_rate,
        i.gst_amount,
        i.total_amount,
        i.created_at,
        c.id AS customer_id,
        c.customer_name,
        c.address,
        c.pan_number,
        c.gst_number,
        c.status AS customer_status
      FROM invoices i
      INNER JOIN customers c ON c.id = i.customer_id
      WHERE i.id = ?
    `,
    [invoiceId],
  );

  if (!invoiceRow) {
    return null;
  }

  const [itemRows] = await pool.query(
    `
      SELECT
        ii.id,
        ii.quantity,
        ii.unit_price,
        ii.line_total,
        it.id AS item_id,
        it.item_name
      FROM invoice_items ii
      INNER JOIN items it ON it.id = ii.item_id
      WHERE ii.invoice_id = ?
      ORDER BY ii.id ASC
    `,
    [invoiceId],
  );

  return {
    id: invoiceRow.id,
    invoiceCode: invoiceRow.invoice_code,
    subtotalAmount: Number(invoiceRow.subtotal_amount || 0),
    gstRate: Number(invoiceRow.gst_rate || 0),
    gstAmount: Number(invoiceRow.gst_amount || 0),
    totalAmount: Number(invoiceRow.total_amount),
    createdAt: invoiceRow.created_at,
    customer: {
      id: invoiceRow.customer_id,
      name: invoiceRow.customer_name,
      address: invoiceRow.address,
      panNumber: invoiceRow.pan_number,
      gstNumber: invoiceRow.gst_number || '',
      isGstRegistered: Boolean(invoiceRow.gst_number && String(invoiceRow.gst_number).trim()),
      status: invoiceRow.customer_status,
    },
    items: itemRows.map((row) => ({
      id: row.id,
      itemId: row.item_id,
      name: row.item_name,
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
      lineTotal: Number(row.line_total),
    })),
  };
}

async function createInvoice(pool, customerId, items) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[customer]] = await connection.query(
      'SELECT * FROM customers WHERE id = ? AND status = "active"',
      [customerId],
    );

    if (!customer) {
      await connection.rollback();
      return { status: 400, body: { message: 'Selected customer is not available.' } };
    }

    let subtotalAmount = 0;
    const normalizedItems = [];

    for (const entry of items) {
      const itemId = Number(entry.itemId);
      const quantity = Number(entry.quantity);

      if (!Number.isInteger(itemId) || !Number.isInteger(quantity) || quantity <= 0) {
        await connection.rollback();
        return { status: 400, body: { message: 'Invoice contains invalid item data.' } };
      }

      const [[item]] = await connection.query(
        'SELECT * FROM items WHERE id = ? AND status = "active"',
        [itemId],
      );

      if (!item) {
        await connection.rollback();
        return { status: 400, body: { message: 'One or more items are not available.' } };
      }

      const unitPrice = Number(item.unit_price);
      const lineTotal = unitPrice * quantity;

      subtotalAmount += lineTotal;
      normalizedItems.push({
        itemId,
        quantity,
        unitPrice,
        lineTotal,
      });
    }

    const gstRate = isGstRegistered(customer) ? 0 : 18;
    const gstAmount = Number(((subtotalAmount * gstRate) / 100).toFixed(2));
    const totalAmount = Number((subtotalAmount + gstAmount).toFixed(2));

    const [invoiceResult] = await connection.query(
      `
        INSERT INTO invoices (
          customer_id,
          subtotal_amount,
          gst_rate,
          gst_amount,
          total_amount
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [customerId, subtotalAmount, gstRate, gstAmount, totalAmount],
    );

    const invoiceCode = `INVC${String(invoiceResult.insertId).padStart(6, '0')}`;

    await connection.query(
      'UPDATE invoices SET invoice_code = ? WHERE id = ?',
      [invoiceCode, invoiceResult.insertId],
    );

    for (const item of normalizedItems) {
      await connection.query(
        `
          INSERT INTO invoice_items (invoice_id, item_id, quantity, unit_price, line_total)
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          invoiceResult.insertId,
          item.itemId,
          item.quantity,
          item.unitPrice,
          item.lineTotal,
        ],
      );
    }

    await connection.commit();

    return {
      status: 201,
      body: await fetchInvoiceDetails(pool, invoiceResult.insertId),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  fetchInvoiceDetails,
  createInvoice,
};
