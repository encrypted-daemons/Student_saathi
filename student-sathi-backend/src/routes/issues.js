const express = require('express');
const router = express.Router();
const { raiseIssue, getOwnerIssues, updateStatus } = require('../controllers/issueController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, raiseIssue);
router.get('/owner', protect, getOwnerIssues);
router.put('/:id', protect, updateStatus);

module.exports = router;