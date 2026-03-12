import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required (e.g., Remote, New York)']
    },
    salaryRange: {
        type: String,
        default: 'Not specified'
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        default: 'Full-time'
    },
    // We store the ID from the Auth Service here to know who posted it
    employerId: {
        type: String, 
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Job', jobSchema);