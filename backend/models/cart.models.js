import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
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
    },
    image: {
        type: String,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(product, quantity = 1) {
    const existingItem = this.items.find(item => 
        item.product.toString() === product._id.toString()
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({
            product: product._id,
            name: product.name,
            quantity: quantity,
            price: product.price,
            image: product.images[0]?.url || product.images[0]?.path
        });
    }
    return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
    const item = this.items.find(item => 
        item.product.toString() === productId.toString()
    );

    if (item) {
        item.quantity = quantity;
        return this.save();
    }
    return Promise.reject(new Error('Item not found in cart'));
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(item => 
        item.product.toString() !== productId.toString()
    );
    return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;