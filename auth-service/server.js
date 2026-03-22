import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Route Imports
import authRoutes from './routes/authRoutes.js';

// Swagger Documentation Imports
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// DNS Configuration
// import dns from "node:dns/promises";
// dns.setServers(["1.1.1.1", "8.8.8.8"]);

// 1. Load environment variables
dotenv.config();

// 2. Initialize Express app
const app = express();

// 3. Configure Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

// Configure CORS
app.use(cors({
    origin: ['http://localhost:5173', 'https://hire-sphere-jade.vercel.app'], 
    credentials: true 
}));

// 4. Basic Health Check Route
app.get('/api/auth/health', (req, res) => {
    res.status(200).json({ 
        service: 'Auth Service', 
        status: 'Operational', 
        time: new Date().toISOString() 
    });
});

// 5. Mount Primary Routes
app.use('/api/auth', authRoutes);

// ==========================================
// 6. SWAGGER API DOCUMENTATION SETUP
// ==========================================
// Read the swagger.json file dynamically using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'));

// Serve the interactive UI on the /api-docs endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// ==========================================

// 7. Database Connection and Server Start
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB (users_db)');
        app.listen(PORT, () => {
            console.log(`🚀 Auth Service is running on http://localhost:${PORT}`);
            console.log(`📄 API Documentation available at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((error) => {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        process.exit(1); 
    });