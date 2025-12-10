const express = require('express');
const router = express.Router();
const { createEvent, getEvents, joinEvent, updateStatus } = require('../controllers/eventController');
const { protect } = require('../middlewares/auth');

// Public
router.get('/', getEvents);

// Protected (Any logged in user can post)
router.post('/', protect, createEvent);
router.put('/:id/join', protect, joinEvent);
router.put('/:id/status', protect, updateStatus); // New Route

module.exports = router;