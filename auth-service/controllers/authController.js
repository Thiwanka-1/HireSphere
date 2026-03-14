import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper function to generate JWT and set HttpOnly Cookie
const generateTokenAndSetCookie = (res, userId, userRole) => {
    const token = jwt.sign({ id: userId, role: userRole }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, companyName, companyWebsite } = req.body;

        // Basic Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Employer-specific validation
        if (role === 'employer' && !companyName) {
            return res.status(400).json({ message: 'Employers must provide a company name' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({
            name, email, password, role, companyName, companyWebsite
        });

        if (user) {
            generateTokenAndSetCookie(res, user._id, user.role);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.companyName,       // FIXED: Now sending to frontend
                companyWebsite: user.companyWebsite  // FIXED: Now sending to frontend
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user and explicitly select the password field (since we hid it in the model)
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account deactivated' });
        }

        generateTokenAndSetCookie(res, user._id, user.role);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyName: user.companyName,       // FIXED
            companyWebsite: user.companyWebsite  // FIXED
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            
            // Only update password if provided
            if (req.body.password) {
                user.password = req.body.password;
            }

            // Only employers can update company details
            if (user.role === 'employer') {
                user.companyName = req.body.companyName || user.companyName;
                user.companyWebsite = req.body.companyWebsite || user.companyWebsite;
            }

            const updatedUser = await user.save();
            
            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                companyName: updatedUser.companyName,       // FIXED
                companyWebsite: updatedUser.companyWebsite  // FIXED
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
};

export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user._id.toString() === req.user._id.toString()) {
                return res.status(400).json({ message: 'You cannot change your own status' });
            }
            
            user.isActive = !user.isActive; 
            await user.save();
            
            res.status(200).json({ message: `User status updated to ${user.isActive ? 'Active' : 'Deactivated'}` });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status', error: error.message });
    }
};

// @desc    Delete user profile (Self-deletion)
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteUserProfile = async (req, res) => {
    try {
        // req.user._id is completely secure because it comes from the verified JWT token
        const user = await User.findById(req.user._id);

        if (user) {
            await User.deleteOne({ _id: user._id });
            
            // Destroy the cookie so they are logged out
            res.cookie('jwt', '', {
                httpOnly: true,
                expires: new Date(0)
            });
            
            res.status(200).json({ message: 'User account deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting profile', error: error.message });
    }
};

// @desc    Delete any user by ID (Admin-only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (user) {
            // Optional: Prevent admins from deleting themselves through this specific route
            if (user._id.toString() === req.user._id.toString()) {
                return res.status(400).json({ message: 'You cannot delete yourself from the admin panel.' });
            }

            await User.deleteOne({ _id: user._id });
            res.status(200).json({ message: 'User deleted successfully by Admin' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};