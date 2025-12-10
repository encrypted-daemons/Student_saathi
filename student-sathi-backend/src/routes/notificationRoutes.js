const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth'); // Agar auth middleware hai to use karo

// Get & Post
router.route('/')
  .get(protect, getNotifications) // Login users hi notification dekhenge
  .post(protect, createNotification); // Sirf admin/system create karega (Future scope)

// Mark Read
router.route('/:id/read').put(protect, markAsRead);

module.exports = router;