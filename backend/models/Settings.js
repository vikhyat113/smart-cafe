const mongoose = require('mongoose');

// Settings is a singleton collection — there is only ever one document.
const settingsSchema = new mongoose.Schema(
  {
    cafeName: { type: String, default: 'Smart Cafe' },
    logo: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    openingHours: { type: String, default: '9:00 AM - 10:00 PM' },
    currencySymbol: { type: String, default: '₹' },
    totalTables: { type: Number, default: 30 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
