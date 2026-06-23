const crypto = require('crypto');

/**
 * Generates a short, human-readable, unique-enough order id, e.g. ORD-AB12CD.
 * Built from a crypto.randomUUID() so it has cryptographically strong
 * randomness, but trimmed down to 6 uppercase alphanumeric characters so
 * it's easy for customers and staff to read out loud / type.
 */
function generateOrderId() {
  const raw = crypto.randomUUID().replace(/-/g, '').toUpperCase();
  const code = raw.substring(0, 6);
  return `ORD-${code}`;
}

module.exports = generateOrderId;
