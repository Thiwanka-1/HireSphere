import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();
//new
const app = express();
app.disable('x-powered-by'); // Fixes Snyk Information Exposure
app.use(cors({
    origin: ['http://localhost:5173', 'https://hire-sphere-jade.vercel.app'], 
    credentials: true 
}));

app.use(morgan('dev'));

app.get('/health', (req, res) => {
    res.status(200).json({ service: 'API Gateway', status: 'Operational' });
});
//new
// ==========================================
// 3. Define the Proxy Routing Rules (UPDATED)
// ==========================================
// We add pathRewrite to put the "/api/..." back onto the URL 
// after Express automatically strips it off.

app.use('/api/auth', createProxyMiddleware({ 
    target: process.env.AUTH_SERVICE_URL, 
    changeOrigin: true,
    pathRewrite: { '^/': '/api/auth/' } // Changes /login back to /api/auth/login
}));

app.use('/api/jobs', createProxyMiddleware({ 
    target: process.env.JOB_SERVICE_URL, 
    changeOrigin: true,
    pathRewrite: { '^/': '/api/jobs/' } 
}));

app.use('/api/applications', createProxyMiddleware({ 
    target: process.env.APP_SERVICE_URL, 
    changeOrigin: true,
    pathRewrite: { '^/': '/api/applications/' } 
}));

app.use('/api/interviews', createProxyMiddleware({ 
    target: process.env.INTERVIEW_SERVICE_URL, 
    changeOrigin: true,
    pathRewrite: { '^/': '/api/interviews/' } 
}));
// ==========================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚪 API Gateway is running on http://localhost:${PORT}`);
});