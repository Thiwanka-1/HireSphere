import express from 'express';
import { 
    registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile,
    getAllUsers, getUserById, toggleUserStatus, deleteUserProfile, deleteUserById,
    createAdmin // <-- Added new import
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Private/Protected Routes (Self Management)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
    .delete(protect, deleteUserProfile);

// Admin Only Routes
router.route('/admin')
    .post(protect, authorize('admin'), createAdmin); // <-- The new route!

router.route('/users')
    .get(protect, authorize('admin'), getAllUsers);

router.route('/users/:id')
    .get(protect, authorize('admin', 'employer'), getUserById)
    .delete(protect, authorize('admin'), deleteUserById);

router.route('/users/:id/status')
    .put(protect, authorize('admin'), toggleUserStatus);

export default router;