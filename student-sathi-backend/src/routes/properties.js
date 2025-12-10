const express = require('express');
const router = express.Router();
const { 
  addProperty, 
  getProperties, 
  getPropertyById, 
  deleteProperty, 
  getMyProperties, 
  getProviderStats, 
  updateProperty 
} = require('../controllers/propertyController');

const { protect } = require('../middlewares/auth');

// --- PUBLIC ROUTES ---
router.get('/', getProperties);

// --- PROTECTED ROUTES (Provider) ---

// ⚠️ IMPORTANT: Ye dono routes '/:id' se PEHLE aane chahiye
router.get('/stats', protect, getProviderStats);
router.get('/my-listings', protect, getMyProperties);

// CRUD Operations
router.post('/', protect, addProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

// ⚠️ IMPORTANT: Ye sabse LAST mein aana chahiye
router.get('/:id', getPropertyById);

module.exports = router;