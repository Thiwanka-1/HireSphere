import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// 1. Load environment variables
dotenv.config();

// 2. Initialize Express app
const app = express();

// 3. Configure Middleware
app.use(express.json()); // Parse incoming JSON payloads
app.use(cookieParser()); // Parse cookies (crucial for our JWT strategy)
app.use(helmet()); // Set secure HTTP headers
app.use(morgan('dev')); // Log requests to the terminal for debugging

// Configure CORS to allow requests from our future frontend
app.use(cors({
    origin: 'http://localhost:5173', // Update this if your frontend runs on a different port
    credentials: true // MANDATORY: Allows cookies to be sent cross-origin
}));

// 4. Basic Health Check Route
app.get('/api/auth/health', (req, res) => {
    res.status(200).json({ 
        service: 'Auth Service', 
        status: 'Operational', 
        time: new Date().toISOString() 
    });
});

// 5. Database Connection and Server Start
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB (users_db)');
        app.listen(PORT, () => {
            console.log(`🚀 Auth Service is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        process.exit(1); // Exit the process with failure
    });