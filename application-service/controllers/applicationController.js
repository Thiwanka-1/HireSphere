import Application from '../models/Application.js';
// We will create this utility file in the next step to handle Firebase interactions
import { uploadResumeToFirebase, deleteResumeFromFirebase } from '../utils/firebaseStorage.js';

// @desc    Submit a new job application
// @route   POST /api/applications
// @access  Private (Seeker only)
export const submitApplication = async (req, res) => {
    try {
        const { jobId, coverLetter } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF resume' });
        }

        // =====================================================================
        // ⭐ INTER-SERVICE COMMUNICATION ⭐
        // We must verify the job actually exists in the Job Service database
        // =====================================================================
        try {
            const jobResponse = await fetch(`${process.env.JOB_SERVICE_URL}/${jobId}`);
            
            if (!jobResponse.ok) {
                return res.status(404).json({ message: 'Job not found in the Job Listing Service. Cannot apply.' });
            }
        } catch (error) {
            console.error('Service Communication Error:', error);
            return res.status(503).json({ message: 'Job Listing Service is currently unavailable' });
        }

        // Upload the file buffer to Firebase Storage instead of local disk
        const resumeUrl = await uploadResumeToFirebase(req.file);

        const application = await Application.create({
            jobId,
            applicantId: req.user.id,
            resumeUrl, // This is now a permanent public Firebase URL
            coverLetter
        });

        res.status(201).json(application);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }
        res.status(500).json({ message: 'Failed to submit application', error: error.message });
    }
};

// @desc    Get all applications for the logged-in seeker
// @route   GET /api/applications/seeker
// @access  Private (Seeker only)
export const getSeekerApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicantId: req.user.id }).sort('-createdAt');
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
    }
};

// @desc    Get all applications for a specific job (For Employers)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer/Admin only)
export const getApplicationsForJob = async (req, res) => {
    try {
        const applications = await Application.find({ jobId: req.params.jobId }).sort('-createdAt');
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
    }
};

// @desc    Update application status (Pending -> Reviewed -> Interview -> Rejected)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer/Admin only)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const application = await Application.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true, runValidators: true }
        );

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status', error: error.message });
    }
};

// @desc    Delete a single application
// @route   DELETE /api/applications/:id
// @access  Private (Seeker who owns it, or Admin)
export const deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Security: Only the applicant or an admin can delete it
        if (application.applicantId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this application' });
        }

        // Delete the PDF from Firebase to save cloud storage space!
        if (application.resumeUrl) {
            await deleteResumeFromFirebase(application.resumeUrl);
        }

        await application.deleteOne();
        res.status(200).json({ message: 'Application and resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete application', error: error.message });
    }
};

// @desc    Bulk delete applications based on status (e.g., 'Rejected')
// @route   DELETE /api/applications/bulk
// @access  Private (Employer/Admin only)
export const bulkDeleteApplications = async (req, res) => {
    try {
        const { jobId, status } = req.body; // e.g., { "jobId": "123", "status": "Rejected" }

        if (!jobId || !status) {
            return res.status(400).json({ message: 'Please provide both jobId and status' });
        }

        // 1. Find all applications matching the criteria
        const applicationsToDelete = await Application.find({ jobId, status });

        if (applicationsToDelete.length === 0) {
            return res.status(404).json({ message: 'No applications found matching those criteria' });
        }

        // 2. Extract Firebase URLs and delete the physical files from the cloud
        const deleteFilePromises = applicationsToDelete.map(app => {
            if (app.resumeUrl) return deleteResumeFromFirebase(app.resumeUrl);
            return Promise.resolve();
        });
        await Promise.all(deleteFilePromises);

        // 3. Delete the records from the MongoDB database
        const result = await Application.deleteMany({ jobId, status });

        res.status(200).json({ 
            message: `Successfully deleted ${result.deletedCount} applications and their resumes.` 
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to bulk delete applications', error: error.message });
    }
};