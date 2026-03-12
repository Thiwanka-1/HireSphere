import express from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile, 
    updateUserProfile,
    getAllUsers,
    getUserById,
    toggleUserStatus
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Private/Protected Routes (Must be logged in)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Admin Only Routes (Must be logged in AND have 'admin' role)
router.route('/users')
    .get(protect, authorize('admin'), getAllUsers);

router.route('/users/:id')
    .get(protect, authorize('admin'), getUserById);

router.route('/users/:id/status')
    .put(protect, authorize('admin'), toggleUserStatus);

export default router;