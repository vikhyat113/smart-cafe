const mongoose = require('mongoose');

const CATEGORIES = [
  'Coffee',
  'Tea',
  'Pizza',
  'Burger',
  'Pasta',
  'Desserts',
  'Cold Drinks',
];

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' }, // relative path e.g. /uploads/xyz.jpg
    category: { type: String, required: true, enum: CATEGORIES },
    available: { type: Boolean, default: true },
    // Soft delete flag. Menu items are never hard-deleted because past
    // orders reference them (by id) and we never want to break order
    // history. Deleted items are simply excluded from customer/admin
    // listings by default.
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

menuItemSchema.index({ name: 'text', description: 'text' });

menuItemSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('MenuItem', menuItemSchema);
