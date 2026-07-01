const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', verifyToken, getProfile);

// PUT /api/users/profile
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
