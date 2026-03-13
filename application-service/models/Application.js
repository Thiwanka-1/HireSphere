import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: [true, 'Job ID is required']
    },
    applicantId: {
        type: String,
        required: [true, 'Applicant ID is required']
    },
    resumeUrl: {
        type: String,
        required: [true, 'Resume file is required']
    },
    coverLetter: {
        type: String
    },
    status: {
        type: String,
        // ADDED 'Closed' to the allowed statuses
        enum: ['Pending', 'Reviewed', 'Interview Scheduled', 'Rejected', 'Closed'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

// Prevent a user from applying to the same job twice
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);