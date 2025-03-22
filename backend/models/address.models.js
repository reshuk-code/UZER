import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxLength: [50, 'Name cannot exceed 50 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
        maxLength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxLength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        maxLength: [50, 'State name cannot exceed 50 characters']
    },
    pinCode: {
        type: String,
        required: [true, 'PIN code is required'],
        match: [/^[0-9]{5}$/, 'Please enter a valid 5-digit PIN code']
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
addressSchema.index({ user: 1, isDefault: 1 });

// Pre-save middleware to ensure only one default address
addressSchema.pre('save', async function(next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

// Virtual for full address string
addressSchema.virtual('fullAddress').get(function() {
    return `${this.street}, ${this.city}, ${this.state} - ${this.pinCode}`;
});

// Method to validate phone number
addressSchema.methods.validatePhone = function() {
    return /^[0-9]{10}$/.test(this.phone);
};

const Address = mongoose.model('Address', addressSchema);

export default Address;