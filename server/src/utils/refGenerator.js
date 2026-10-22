const crypto = require('crypto');

function generateBookingReference() {
  const now = new Date();
  const yearShort = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `DWK-${yearShort}${month}-${randomHex}`;
}

module.exports = { generateBookingReference };
