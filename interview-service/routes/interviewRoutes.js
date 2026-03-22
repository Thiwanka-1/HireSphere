import express from 'express';
import { 
    scheduleInterview, 
    updateInterview,
    getEmployerInterviews, 
    getSeekerInterviews,
    deleteInterview,
    bulkCleanInterviews,
    deleteInterviewsByUser
} from '../controllers/interviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Employer Routes
router.post('/', protect, authorize('employer', 'admin'), scheduleInterview);
router.get('/employer', protect, authorize('employer', 'admin'), getEmployerInterviews);
router.put('/:id', protect, authorize('employer', 'admin'), updateInterview);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteInterview);
router.delete('/bulk/cleanup', protect, authorize('employer', 'admin'), bulkCleanInterviews);
router.delete('/user/:userId', protect, authorize('employer', 'seeker', 'admin'), deleteInterviewsByUser);
// Seeker Routes
router.get('/seeker', protect, authorize('seeker'), getSeekerInterviews);

export default router;