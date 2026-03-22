import Job from '../models/Job.js';

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Employer/Admin only)
export const createJob = async (req, res) => {
    try {
        // Add the employerId from the JWT token to the request body
        req.body.employerId = req.user.id;

        const job = await Job.create(req.body);
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create job', error: error.message });
    }
};

// @desc    Get all active jobs (with basic search/filtering)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
    try {
        const query = { isActive: true };
        
        // SECURITY FIX: Explicitly cast query parameters to strings 
        // to prevent NoSQL Object Injection attacks (Improper Type Validation)
        if (req.query.location) {
            // Now "remote" will match "Remote", "remote", and "Remote/Hybrid"
            query.location = { $regex: String(req.query.location), $options: 'i' };
        }
        if (req.query.jobType) {
            query.jobType = String(req.query.jobType);
        }
        if (req.query.search) {
            // Simple text search on the title
            query.title = { $regex: String(req.query.search), $options: 'i' };
        }

        const jobs = await Job.find(query).sort('-createdAt');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job', error: error.message });
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Employer/Admin only)
export const updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // SECURITY CHECK: Ensure the person updating the job is the one who created it (or an admin)
        if (job.employerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'User not authorized to update this specific job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true
        });

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update job', error: error.message });
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer who created it, or Admin)
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // SECURITY CHECK: Ownership validation
        if (job.employerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'User not authorized to delete this specific job' });
        }

        // 🚀 TRIGGER MICROSERVICE INTEGRATION: Tell App Service to delete all applications for this job!
        try {
            await fetch(`${process.env.APP_SERVICE_URL}/job/cascade/${job._id}`, {
                method: 'DELETE',
                headers: { 'Cookie': req.headers.cookie } // Pass the auth cookie securely
            });
            console.log(`Cascade delete triggered for Job ID: ${job._id}`);
        } catch (err) {
            console.error('Service Communication Error:', err.message);
        }

        await job.deleteOne();

        res.status(200).json({ message: 'Job removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete job', error: error.message });
    }
};

// @desc    Get all jobs created by the currently logged-in employer
// @route   GET /api/jobs/employer/me
// @access  Private (Employer only)
export const getEmployerJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ employerId: req.user.id }).sort('-createdAt');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch your jobs', error: error.message });
    }
};

// @desc    Delete all jobs for a specific employer (Cascaded from Auth)
export const deleteJobsByEmployer = async (req, res) => {
    try {
        await Job.deleteMany({ employerId: req.params.employerId });
        res.status(200).json({ message: 'All employer jobs deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cascade delete jobs', error: error.message });
    }
};