import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import interviewRoutes from './routes/interviewRoutes.js';

// Swagger Documentation Imports
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// import dns from "node:dns/promises";
// dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

app.use(cors({
    origin: ['http://localhost:5173', 'https://hire-sphere-jade.vercel.app'], 
    credentials: true 
}));

app.use('/api/interviews', interviewRoutes);

app.get('/api/interviews/health', (req, res) => {
    res.status(200).json({ service: 'Interview Service', status: 'Operational' });
});

// ==========================================
// 6. SWAGGER API DOCUMENTATION SETUP
// ==========================================
// Read the swagger.json file dynamically using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



const PORT = process.env.PORT || 5004;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB (interviews_db)');
        app.listen(PORT, () => console.log(`🚀 Interview Service running on port ${PORT}`));
        console.log(`📄 API Documentation available at http://localhost:${PORT}/api-docs`);
    })
    .catch((error) => console.error('❌ Database connection failed:', error.message));