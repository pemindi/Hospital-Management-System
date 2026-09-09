const express = require('express');
const router = express.Router();
const { register, login, getMe, googleAuth, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot', forgotPassword);
router.post('/reset/:token', resetPassword);
router.post('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

module.exports = router;