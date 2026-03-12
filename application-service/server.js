import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import applicationRoutes from './routes/applicationRoutes.js';

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

// Make the uploads folder publicly accessible so employers can download the resumes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/applications/health', (req, res) => {
    res.status(200).json({ service: 'Application Service', status: 'Operational' });
});

app.use('/api/applications', applicationRoutes);

const PORT = process.env.PORT || 5003;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB (applications_db)');
        app.listen(PORT, () => {
            console.log(`🚀 Application Service is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    });