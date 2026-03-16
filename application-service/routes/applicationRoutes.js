import express from 'express';
import { 
    submitApplication,
    getSeekerApplications,
    getApplicationsForJob,
    updateApplicationStatus,
    deleteApplication,       // <-- ADDED MISSING IMPORT
    bulkDeleteApplications   // <-- ADDED MISSING IMPORT
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ==========================================
// Seeker Routes
// ==========================================
// Note: We use upload.single('resume') to intercept the file upload before the controller runs
router.post('/', protect, authorize('seeker'), upload.single('resume'), submitApplication);
router.get('/seeker', protect, authorize('seeker'), getSeekerApplications);

// ==========================================
// Employer & Admin Routes
// ==========================================
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getApplicationsForJob);
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

// IMPORTANT: '/bulk' must come BEFORE '/:id' so Express doesn't confuse 'bulk' for an ID
router.delete('/bulk', protect, authorize('employer', 'admin'), bulkDeleteApplications);

// ==========================================
// Shared Delete Route (Seeker withdrawing or Admin overriding)
// ==========================================
router.delete('/:id', protect, authorize('seeker', 'admin'), deleteApplication);

export default router;