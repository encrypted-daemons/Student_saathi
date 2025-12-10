const express = require('express');
const router = express.Router();
const { 
    getStats, getUsers, verifyProvider, broadcast,
    getAllDisputes, resolveDispute, getLogs // 👈 Import New
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// Sirf Admin hi ye APIs use kar sakta hai
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/verify/:id', verifyProvider);
router.post('/broadcast', broadcast);
router.get('/disputes', getAllDisputes); // ✅ New
router.put('/disputes/:id', resolveDispute); // ✅ New
router.get('/logs', getLogs); // ✅ New

module.exports = router;