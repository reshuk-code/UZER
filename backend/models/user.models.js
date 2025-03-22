import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State/Province is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
        trim: true
    },
}, {
    timestamps: true
});

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        select: false
    },
    verificationCodeExpires: {
        type: Date,
        select: false
    },
    resetPasswordToken: {
        type: String,
        default: undefined
    },
    resetPasswordExpire: {
        type: Date,
        default: undefined
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    addresses: {
        type: [addressSchema],
        required: false, // Make addresses array optional
        default: [] // Set default to empty array
    }, // Optional array of addresses
    profilePicture: {
        type: String,
        default: 'https://as1.ftcdn.net/v2/jpg/03/46/83/96/500_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg'
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;