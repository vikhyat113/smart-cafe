const express = require('express');
const {
  getMenu,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  restoreMenuItem,
} = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(getMenu));
router.post('/', protect, upload.single('image'), asyncHandler(createMenuItem));
router.put('/:id', protect, upload.single('image'), asyncHandler(updateMenuItem));
router.patch('/:id/availability', protect, asyncHandler(toggleAvailability));
router.patch('/:id/restore', protect, asyncHandler(restoreMenuItem));
router.delete('/:id', protect, asyncHandler(deleteMenuItem));

module.exports = router;
