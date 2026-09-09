const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  linkEmployee,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Admin-only user management
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.patch('/:id/link-employee', authorize('admin'), linkEmployee);

module.exports = router;
