const express = require('express');
const router = express.Router();
const { sellItem, getItems, getItemById, markAsSold } = require('../controllers/marketplaceController');
// ...
const { protect } = require('../middlewares/auth');

// Public: Sab dekh sakte hain
router.get('/', getItems);
router.get('/:id', getItemById);

// Protected: Bechne ke liye login zaroori hai
router.post('/', protect, sellItem);
router.put('/:id/sold', protect, markAsSold);

module.exports = router;