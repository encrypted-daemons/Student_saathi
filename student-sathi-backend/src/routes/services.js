const express = require('express');
const router = express.Router();
const { 
  addService, 
  getServices, 
  getServiceById, 
  getMyServices,  
  getServiceStats, 
  updateService,
  deleteService 
} = require('../controllers/serviceController');
const { protect } = require('../middlewares/auth');

// --- 1. SPECIFIC ROUTES (MUST BE TOP) ---
router.get('/stats', protect, getServiceStats);
router.get('/my-services', protect, getMyServices); // ✅ Ye line upar honi chahiye

// --- 2. GENERAL ROUTES ---
router.get('/', getServices);
router.post('/', protect, addService);

// --- 3. DYNAMIC ROUTES (MUST BE BOTTOM) ---
router.get('/:id', getServiceById);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;