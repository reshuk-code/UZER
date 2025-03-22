import jwt from 'jsonwebtoken';
import User from '../../models/user.models.js';
import bcrypt from 'bcrypt';
import  AppError  from '../../utils/AppError.js';
// Generate JWT Token
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Compare Password
export const comparePassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
};

export const protect = async (req, res, next) => {
    try {
        // Get token from header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }
        
        if (!token) {
            throw new AppError('Please login to access this resource', 401);
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        next(new AppError('Authentication failed', 401));
    }
};

// Check Review Ownership Middleware
export const checkReviewOwnership = async (req, res, next) => {
    try {
        const review = req.review; // Assuming review is attached by previous middleware
        
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        if (review.user.toString() !== req.user._id.toString()) {
            throw new AppError('You can only modify your own reviews', 403);
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Admin Middleware
export const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

// Email Verification Middleware
export const verifyEmail = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        user.isVerified = true;
        await user.save();
        next();
    } catch (error) {
        res.status(400);
        throw new Error('Email verification failed');
    }
};