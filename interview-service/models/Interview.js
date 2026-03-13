import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
    applicationId: { type: String, required: true },
    employerId: { type: String, required: true },
    applicantId: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    meetingLink: { type: String, required: true },
    status: {
        type: String,
        enum: ['Scheduled', 'Rescheduled', 'Completed', 'Canceled', 'Passed', 'Failed'],
        default: 'Scheduled'
    }
}, { timestamps: true });

// Ensure an employer can't accidentally double-book themselves at the exact same time
interviewSchema.index({ employerId: 1, scheduledDate: 1 }, { unique: true });

export default mongoose.model('Interview', interviewSchema);