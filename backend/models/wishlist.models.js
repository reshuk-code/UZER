import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// Index for faster queries
wishlistSchema.index({ user: 1 });

// Method to check if product exists in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
    return this.products.includes(productId);
};

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
    if (!this.hasProduct(productId)) {
        this.products.push(productId);
    }
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
    this.products = this.products.filter(id => !id.equals(productId));
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;