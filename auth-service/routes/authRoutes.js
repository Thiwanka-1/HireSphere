import express from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile, 
    updateUserProfile,
    getAllUsers,
    getUserById,
    toggleUserStatus,
    deleteUserProfile,
    deleteUserById
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
    .get(protect, authorize('admin', 'employer'), getUserById);

router.route('/users/:id/status')
    .put(protect, authorize('admin'), toggleUserStatus);

    // Private/Protected Routes (Must be logged in)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
    .delete(protect, deleteUserProfile); // <-- ADD THIS (Self Deletion)

// Admin Only Routes
router.route('/users/:id')
    .get(protect, authorize('admin', 'employer'), getUserById)
    .put(protect, authorize('admin'), toggleUserStatus) // (Your existing toggle status route)
    .delete(protect, authorize('admin'), deleteUserById); // <-- ADD THIS (Admin Deletion)

export default router;