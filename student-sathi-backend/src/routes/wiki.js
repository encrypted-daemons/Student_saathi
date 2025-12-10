const express = require('express');
const router = express.Router();
const { addWikiInfo, getWikiInfo } = require('../controllers/wikiController');
const { protect } = require('../middlewares/auth');

// Public: Koi bhi student dekh sakta hai (Bina login ke bhi agar chaho to)
router.get('/', getWikiInfo);

// Protected: Sirf Admin add karega
router.post('/', protect, addWikiInfo);

module.exports = router;