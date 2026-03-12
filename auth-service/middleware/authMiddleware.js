import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Protect routes (Verify JWT)
export const protect = async (req, res, next) => {
    let token;

    // Check if token exists in cookies
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from DB and attach to request object (excluding password)
        req.user = await User.findById(decoded.id).select('-password');

        // Check if user has been deactivated by an admin
        if (!req.user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
        }

        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// 2. Role-based Authorization (Principle of Least Privilege)
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role '${req.user.role}' is not authorized to access this route` 
            });
        }
        next();
    };
};