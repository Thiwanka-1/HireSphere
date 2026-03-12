import express from 'express';
import { 
    createJob, 
    getJobs, 
    getJobById, 
    updateJob, 
    deleteJob,
    getEmployerJobs
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (Anyone can view jobs)
router.get('/', getJobs);
router.get('/:id', getJobById);
router.get('/employer/me', protect, authorize('employer'), getEmployerJobs); // ADD THIS LINE
// Protected routes (Only logged in employers or admins can modify jobs)
router.post('/', protect, authorize('employer', 'admin'), createJob);
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

export default router;