import jwt from 'jsonwebtoken';

// 1. Verify JWT Cookie
export const protect = (req, res, next) => {
    let token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        // Decode the token using the shared secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded payload directly to the request
        // Now req.user has the 'id' and 'role' embedded from the Auth Service!
        req.user = decoded; 
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// 2. Role-based Authorization
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