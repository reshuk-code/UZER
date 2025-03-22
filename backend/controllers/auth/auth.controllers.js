import User from '../../models/user.models.js';
import { generateToken, hashPassword, comparePassword } from '../../config/auth/auth.js';
import sendEmail from '../../utils/sendEmail.js';
import crypto from 'crypto';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Code expires in 10 minutes
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Hash password
        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            verificationCode,
            verificationCodeExpires
        });

        // Send verification email with code
        await sendEmail({
            email: user.email,
            subject: 'Verify your email',
            message: `Your verification code is: ${verificationCode}\nThis code will expire in 10 minutes.`
        });

        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: generateToken(user._id),
            message: 'Registration successful. Please check your email for verification code.'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const verifyEmailWithCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validate input
        if (!email || !code) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and verification code are required'
            });
        }

        // Find user with matching verification code
        const user = await User.findOne({
            email,
            verificationCode: code,
            verificationCodeExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired verification code'
            });
        }

        // Update user verification status
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Something went wrong while verifying email'
        });
    }
};



// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await comparePassword(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ 
            email,
            verificationCode: code,
            verificationCodeExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Update user directly instead of using findByIdAndUpdate
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
        
        // Save the updated user
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message: `Please click on this link to reset your password: ${resetUrl}`
            });

            res.json({ 
                success: true,
                message: 'Password reset email sent' 
            });
        } catch (emailError) {
            // If email fails, reset the tokens
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            throw new Error('Email could not be sent');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(400).json({ 
            success: false,
            message: 'Could not send password reset email',
            error: error.message 
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await hashPassword(req.body.password);

        // Only update password related fields
        await User.findByIdAndUpdate(
            user._id,
            {
                password: hashedPassword,
                resetPasswordToken: undefined,
                resetPasswordExpire: undefined
            },
            { 
                new: true,
                runValidators: false // Disable validation for this update
            }
        );

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ 
            message: 'Could not reset password',
            error: error.message 
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.email = req.body.email || user.email;
        
        if (req.body.password) {
            user.password = await hashPassword(req.body.password);
        }

        if (req.file) {
            user.profilePicture = req.file.path;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            profilePicture: updatedUser.profilePicture,
            token: generateToken(updatedUser._id)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('addresses');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};
