import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendDynamicEmail = async (candidateEmail, type, meetingDate, meetingLink) => {
    // FIX: Since the controller already formats the date to Sri Lankan time, 
    // we just use it directly instead of trying to parse it with new Date() again!
    const formattedDate = meetingDate || '';
    
    let subject = '';
    let html = '';

    switch (type) {
        case 'Scheduled':
            subject = 'Interview Invitation - HireSphere';
            html = `<h2>Congratulations!</h2><p>Your interview is scheduled for <strong>${formattedDate}</strong>.</p><p>Join here: <a href="${meetingLink}">${meetingLink}</a></p>`;
            break;
        case 'Rescheduled':
            subject = 'Interview UPDATE - HireSphere';
            html = `<h2>Interview Rescheduled</h2><p>Your interview has been moved to <strong>${formattedDate}</strong>.</p><p>Join here: <a href="${meetingLink}">${meetingLink}</a></p>`;
            break;
        case 'Canceled':
            subject = 'Interview Canceled - HireSphere';
            html = `<h2>Interview Update</h2><p>We regret to inform you that your upcoming interview has been canceled. The employer will reach out with further details.</p>`;
            break;
        case 'Passed':
            subject = 'Great News! You Passed - HireSphere';
            html = `<h2>Congratulations!</h2><p>You have successfully passed the interview stage! The company HR will contact you shortly regarding the next steps and offer details.</p>`;
            break;
        case 'Failed':
            subject = 'Application Update - HireSphere';
            html = `<h2>Status Update</h2><p>Thank you for your time. Unfortunately, the team has decided to move forward with other candidates at this time. We wish you the best in your job search.</p>`;
            break;
    }

    const mailOptions = {
        from: `"HireSphere Talent" <${process.env.EMAIL_USER}>`,
        to: candidateEmail,
        subject: subject,
        html: html
    };

    await transporter.sendMail(mailOptions);
};