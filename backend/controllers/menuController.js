const MenuItem = require('../models/MenuItem');

// GET /api/menu
// Public customers only ever see non-deleted items. Admins (detected via
// ?admin=true, used by the menu management page) see everything including
// hidden/unavailable items so they can manage them.
async function getMenu(req, res) {
  const { category, search, admin } = req.query;
  const filter = { isDeleted: false };

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Admin view can optionally include soft-deleted items for a full audit trail
  if (admin === 'true' && req.query.includeDeleted === 'true') {
    delete filter.isDeleted;
  }

  const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
  res.json(items);
}

// POST /api/menu (admin)
async function createMenuItem(req, res) {
  const { name, description, price, category } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'name, price and category are required' });
  }

  if (!MenuItem.CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `category must be one of: ${MenuItem.CATEGORIES.join(', ')}` });
  }

  const image = req.file ? `/uploads/${req.file.filename}` : '';

  const item = await MenuItem.create({
    name,
    description,
    price: Number(price),
    category,
    image,
    available: req.body.available !== undefined ? req.body.available === 'true' || req.body.available === true : true,
  });

  res.status(201).json(item);
}

// PUT /api/menu/:id (admin)
async function updateMenuItem(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item || item.isDeleted) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  const { name, description, price, category, available } = req.body;

  if (category && !MenuItem.CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `category must be one of: ${MenuItem.CATEGORIES.join(', ')}` });
  }

  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (price !== undefined) item.price = Number(price);
  if (category !== undefined) item.category = category;
  if (available !== undefined) item.available = available === 'true' || available === true;
  if (req.file) item.image = `/uploads/${req.file.filename}`;

  await item.save();
  res.json(item);
}

// PATCH /api/menu/:id/availability (admin) — quick hide/restore or
// toggle "Currently Unavailable" without touching other fields.
async function toggleAvailability(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item || item.isDeleted) {
    return res.status(404).json({ message: 'Menu item not found' });
  }
  item.available = req.body.available !== undefined ? Boolean(req.body.available) : !item.available;
  await item.save();
  res.json(item);
}

// DELETE /api/menu/:id (admin) — soft delete. Past orders snapshot their
// own name/price, so they remain fully intact and viewable even after
// the menu item itself is removed from active listings.
async function deleteMenuItem(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item || item.isDeleted) {
    return res.status(404).json({ message: 'Menu item not found' });
  }
  item.isDeleted = true;
  item.available = false;
  await item.save();
  res.json({ message: 'Menu item deleted', id: item._id });
}

// PATCH /api/menu/:id/restore (admin) — undo a soft delete.
async function restoreMenuItem(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Menu item not found' });
  }
  item.isDeleted = false;
  await item.save();
  res.json(item);
}

module.exports = {
  getMenu,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  restoreMenuItem,
};
