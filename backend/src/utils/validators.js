function parsePositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function validateStatus(status) {
  return status === 'active' || status === 'inactive';
}

function isGstRegistered(customer) {
  return Boolean(customer.gst_number && String(customer.gst_number).trim());
}

function isValidPanNumber(value) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(value || '').trim().toUpperCase());
}

function isValidGstNumber(value) {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
    String(value || '').trim().toUpperCase(),
  );
}

module.exports = {
  parsePositiveNumber,
  validateStatus,
  isGstRegistered,
  isValidPanNumber,
  isValidGstNumber,
};
