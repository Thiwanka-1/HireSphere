import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import interviewRoutes from './routes/interviewRoutes.js';

import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true 
}));

app.use('/api/interviews', interviewRoutes);

app.get('/api/interviews/health', (req, res) => {
    res.status(200).json({ service: 'Interview Service', status: 'Operational' });
});

const PORT = process.env.PORT || 5004;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB (interviews_db)');
        app.listen(PORT, () => console.log(`🚀 Interview Service running on port ${PORT}`));
    })
    .catch((error) => console.error('❌ Database connection failed:', error.message));