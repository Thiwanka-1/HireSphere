import Interview from '../models/Interview.js';
import { sendDynamicEmail } from '../utils/emailService.js';

// Helper function to fetch user email via Inter-Service Communication
const getApplicantEmail = async (applicantId, cookieString) => {
    try {
        const response = await fetch(`${process.env.AUTH_SERVICE_URL}/users/${applicantId}`, {
            headers: { 'Cookie': cookieString }
        });
        if (response.ok) {
            const data = await response.json();
            return data.email;
        }
    } catch (error) {
        console.error('Failed to fetch user email:', error);
    }
    return null;
};
// @desc    Schedule a new interview
export const scheduleInterview = async (req, res) => {
    try {
        const { applicationId, applicantId, scheduledDate, meetingLink } = req.body;

        // 1. Conflict Prevention
        const existingInterview = await Interview.findOne({ 
            employerId: req.user.id, 
            scheduledDate: new Date(scheduledDate) 
        });

        if (existingInterview) {
            return res.status(409).json({ message: 'Time conflict: You already have an interview scheduled at this exact time.' });
        }

        const interview = await Interview.create({
            applicationId, applicantId, employerId: req.user.id, scheduledDate, meetingLink
        });

        // 2. Fetch Email from Auth Service and Send (With Sri Lanka Timezone Fix)
        const email = await getApplicantEmail(applicantId, req.headers.cookie);
        if (email) {
            // Format the UTC date to local Sri Lankan time for the email
            const formattedLocalTime = new Date(scheduledDate).toLocaleString('en-US', { 
                timeZone: 'Asia/Colombo', 
                dateStyle: 'full', 
                timeStyle: 'short' 
            });
            await sendDynamicEmail(email, 'Scheduled', formattedLocalTime, meetingLink);
        }

        // 3. Update Application Status to "Interview Scheduled"
        try {
            await fetch(`${process.env.APP_SERVICE_URL}/api/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    cookie: req.headers.cookie 
                },
                body: JSON.stringify({ status: 'Interview Scheduled' })
            });
        } catch (error) {
            console.error('Failed to update Application Service status:', error);
        }

        res.status(201).json(interview);
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Time slot already booked.' });
        res.status(500).json({ message: 'Failed to schedule', error: error.message });
    }
};

// @desc    Update/Reschedule/Pass/Fail an interview
export const updateInterview = async (req, res) => {
    try {
        const { scheduledDate, meetingLink, status } = req.body;
        let interview = await Interview.findById(req.params.id);

        if (!interview) return res.status(404).json({ message: 'Interview not found' });
        if (interview.employerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update fields
        if (scheduledDate) interview.scheduledDate = scheduledDate;
        if (meetingLink) interview.meetingLink = meetingLink;
        if (status) interview.status = status;

        await interview.save();

        // Trigger Emails based on status change
        if (status && ['Rescheduled', 'Canceled', 'Passed', 'Failed'].includes(status)) {
            const email = await getApplicantEmail(interview.applicantId, req.headers.cookie);
            if (email) {
                // Format the UTC date to local Sri Lankan time for the email
                const formattedLocalTime = new Date(interview.scheduledDate).toLocaleString('en-US', { 
                    timeZone: 'Asia/Colombo', 
                    dateStyle: 'full', 
                    timeStyle: 'short' 
                });
                await sendDynamicEmail(email, status, formattedLocalTime, interview.meetingLink);
            }
            
            // Sync Statuses with the Application Service
            if (status === 'Passed' || status === 'Failed' || status === 'Canceled') {
                let finalAppStatus = '';
                
                // FIX: Both Passed and Failed result in a "Closed" application status
                if (status === 'Passed' || status === 'Failed') finalAppStatus = 'Closed';
                if (status === 'Canceled') finalAppStatus = 'Reviewed'; // Revert back to reviewed
                
                try {
                    await fetch(`${process.env.APP_SERVICE_URL}/api/applications/${interview.applicationId}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            cookie: req.headers.cookie
                        },
                        body: JSON.stringify({ status: finalAppStatus })
                    });
                } catch (error) {
                    console.error('Failed to update Application Service status:', error);
                }
            }
        }

        res.status(200).json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update', error: error.message });
    }
};

// @desc    Get all interviews for logged in employer
export const getEmployerInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ employerId: req.user.id }).sort('scheduledDate');
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch', error: error.message });
    }
};

// @desc    Get interviews for logged in seeker
export const getSeekerInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ applicantId: req.user.id }).sort('scheduledDate');
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch', error: error.message });
    }
};

// @desc    Delete a single interview
export const deleteInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) return res.status(404).json({ message: 'Not found' });
        
        if (interview.employerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await interview.deleteOne();
        res.status(200).json({ message: 'Interview deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete', error: error.message });
    }
};

// @desc    Bulk delete canceled or failed interviews
export const bulkCleanInterviews = async (req, res) => {
    try {
        const result = await Interview.deleteMany({
            employerId: req.user.id,
            status: { $in: ['Canceled', 'Failed'] }
        });

        res.status(200).json({ message: `Cleaned up ${result.deletedCount} closed interviews.` });
    } catch (error) {
        res.status(500).json({ message: 'Bulk delete failed', error: error.message });
    }
};

// @desc    Delete all interviews associated with a user (employer or seeker)
export const deleteInterviewsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        // Delete if the user is either the employer OR the applicant
        await Interview.deleteMany({ 
            $or: [{ employerId: userId }, { applicantId: userId }] 
        });
        res.status(200).json({ message: 'All associated interviews deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cascade delete interviews', error: error.message });
    }
};