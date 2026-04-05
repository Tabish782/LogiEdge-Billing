function mapCustomer(row) {
  return {
    id: row.id,
    code: row.customer_code || '',
    name: row.customer_name,
    address: row.address,
    panNumber: row.pan_number,
    gstNumber: row.gst_number || '',
    isGstRegistered: Boolean(row.gst_number && String(row.gst_number).trim()),
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapItem(row) {
  return {
    id: row.id,
    code: row.item_code || '',
    name: row.item_name,
    unitPrice: Number(row.unit_price),
    status: row.status,
    createdAt: row.created_at,
  };
}

module.exports = {
  mapCustomer,
  mapItem,
};
