const express = require('express');
const router = express.Router();
const { postRequirement, findMatches } = require('../controllers/roommateController');
const { protect } = require('../middlewares/auth');

// Dono ke liye login zaroori hai
router.post('/post-ad', protect, postRequirement);
router.get('/find-matches', protect, findMatches);

module.exports = router;