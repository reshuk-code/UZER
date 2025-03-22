import express from 'express';
import { 
    registerUser, 
    loginUser, 
    verifyEmail, 
    forgotPassword, 
    resetPassword,
    updateProfile,
    verifyEmailWithCode,
    getProfile,
} from '../controllers/auth/auth.controllers.js';
import { protect } from '../config/auth/auth.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for profile picture upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function (req, file, cb) {
        cb(null, `user-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyEmail);
router.post('/verify-email', verifyEmailWithCode);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile); // Add this route
router.put(
    '/profile', 
    protect, 
    upload.single('profilePicture'), 
    updateProfile
);
export default router;