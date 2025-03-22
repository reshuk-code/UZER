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
    }
});

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        street: String,
        city: String,
        state: String,
        pinCode: String,
        phone: String
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['CASH_ON_DELIVERY', 'ONLINE','BANK', 'ESEWA'],
        default: 'CASH_ON_DELIVERY'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    paymentDetails: {
        accountNumber: String,
        bankName: String,
        holderName: String,
        esewaId: String,
        paymentDate: Date
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    orderNumber: {
        type: String,
        unique: true,
        default: () => 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    }
}, {
    timestamps: true
});

// Virtual for user's full name
orderSchema.virtual('userName').get(function() {
    return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
});

// Method to calculate total amount
orderSchema.methods.calculateTotalAmount = function() {
    return this.orderItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
};

// Pre-save middleware to update total amount
orderSchema.pre('save', async function(next) {
    if (this.isModified('orderItems')) {
        this.totalAmount = this.calculateTotalAmount();
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;