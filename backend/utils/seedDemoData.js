/**
 * Seeds the database with a default admin account, a sample menu, default
 * settings, and a couple of demo orders so the app is usable immediately
 * after setup. Run with: npm run seed
 *
 * Safe to re-run: it skips creating records that already exist.
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const MenuItem = require('../models/MenuItem');
const Settings = require('../models/Settings');
const Order = require('../models/Order');
const generateOrderId = require('./generateOrderId');

const DEMO_MENU = [
  { name: 'Cold Coffee', description: 'Rich coffee blended with vanilla ice cream.', price: 120, category: 'Coffee' },
  { name: 'Cappuccino', description: 'Espresso topped with steamed milk foam.', price: 110, category: 'Coffee' },
  { name: 'Espresso Shot', description: 'Bold, concentrated double shot of espresso.', price: 90, category: 'Coffee' },
  { name: 'Masala Chai', description: 'Spiced Indian tea brewed with milk.', price: 60, category: 'Tea' },
  { name: 'Green Tea', description: 'Light and refreshing antioxidant-rich tea.', price: 70, category: 'Tea' },
  { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella and basil.', price: 250, category: 'Pizza' },
  { name: 'Pepperoni Pizza', description: 'Loaded with spicy pepperoni and cheese.', price: 320, category: 'Pizza' },
  { name: 'Classic Cheese Burger', description: 'Juicy patty with cheddar, lettuce and tomato.', price: 180, category: 'Burger' },
  { name: 'Veggie Burger', description: 'Grilled veggie patty with house sauce.', price: 160, category: 'Burger' },
  { name: 'Alfredo Pasta', description: 'Creamy parmesan alfredo with penne.', price: 220, category: 'Pasta' },
  { name: 'Arrabbiata Pasta', description: 'Spicy tomato pasta with garlic and chili.', price: 210, category: 'Pasta' },
  { name: 'Chocolate Brownie', description: 'Warm fudgy brownie with chocolate sauce.', price: 140, category: 'Desserts' },
  { name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert.', price: 160, category: 'Desserts' },
  { name: 'Fresh Lemonade', description: 'Chilled lemonade with a hint of mint.', price: 80, category: 'Cold Drinks' },
  { name: 'Iced Tea', description: 'Refreshing chilled tea with lemon.', price: 90, category: 'Cold Drinks' },
];

async function seed() {
  await connectDB();

  // --- Default admin ---
  const existingAdmin = await Admin.findOne({ email: 'admin@cafe.com' });
  if (!existingAdmin) {
    await Admin.create({
      name: 'Cafe Admin',
      email: 'admin@cafe.com',
      password: 'admin123', // hashed automatically by the Admin model's pre-save hook
    });
    console.log('Created default admin -> admin@cafe.com / admin123');
  } else {
    console.log('Default admin already exists, skipping.');
  }

  // --- Settings singleton ---
  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({});
    console.log('Created default settings.');
  } else {
    console.log('Settings already exist, skipping.');
  }

  // --- Demo menu ---
  const menuCount = await MenuItem.countDocuments();
  let menuItems = [];
  if (menuCount === 0) {
    menuItems = await MenuItem.insertMany(DEMO_MENU);
    console.log(`Inserted ${menuItems.length} demo menu items.`);
  } else {
    menuItems = await MenuItem.find();
    console.log('Menu items already exist, skipping insert.');
  }

  // --- Demo orders ---
  const orderCount = await Order.countDocuments();
  if (orderCount === 0 && menuItems.length > 0) {
    const coldCoffee = menuItems.find((m) => m.name === 'Cold Coffee') || menuItems[0];
    const margherita = menuItems.find((m) => m.name === 'Margherita Pizza') || menuItems[1];

    const demoOrders = [
      {
        orderId: generateOrderId(),
        tableNumber: 5,
        items: [
          { menuItemId: coldCoffee._id, name: coldCoffee.name, priceAtOrderTime: coldCoffee.price, quantity: 2, specialInstructions: 'Less sugar' },
        ],
        totalAmount: coldCoffee.price * 2,
        status: 'SERVED',
      },
      {
        orderId: generateOrderId(),
        tableNumber: 12,
        items: [
          { menuItemId: margherita._id, name: margherita.name, priceAtOrderTime: margherita.price, quantity: 1, specialInstructions: 'Extra cheese' },
        ],
        totalAmount: margherita.price,
        status: 'PREPARING',
      },
    ];

    await Order.insertMany(demoOrders);
    console.log(`Inserted ${demoOrders.length} demo orders.`);
  } else {
    console.log('Orders already exist, skipping insert.');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
