import express from 'express';
import { 
    submitApplication,
    getSeekerApplications,
    getApplicationsForJob,
    updateApplicationStatus
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Seeker Routes
// Note: We use upload.single('resume') to intercept the file upload before the controller runs
router.post('/', protect, authorize('seeker'), upload.single('resume'), submitApplication);
router.get('/seeker', protect, authorize('seeker'), getSeekerApplications);

// Employer Routes
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getApplicationsForJob);
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

export default router;