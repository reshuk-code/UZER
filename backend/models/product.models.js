import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    images: [{
        path: String
    }],
    videos: [{
        path: String
    }]
}, {
    timestamps: true
});


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: [true, 'Brand is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    SKU: {
        type: String,
        unique: true,
        default: () => 'PRD-' + Math.random().toString(36).substring(2, 7).toUpperCase()
    },
    images: [{
        path: String,
        isUrl: Boolean,
        isMain: {
            type: Boolean,
            default: false
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [reviewSchema],
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});

// Add text search index
productSchema.index({ name: 'text', description: 'text' });
productSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        this.rating = this.reviews.reduce((acc, item) => item.rating + acc, 0) / this.reviews.length;
        this.numReviews = this.reviews.length;
    }
};
const Product = mongoose.model('Product', productSchema);
export default Product;