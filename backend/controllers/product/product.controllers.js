import Product from '../../models/product.models.js';
import AppError from '../../utils/AppError.js';
import { promises as fs } from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadConfig = {
    base: path.join(process.cwd(), 'uploads'),
    reviews: path.join(process.cwd(), 'uploads', 'reviews'),
    products: path.join(process.cwd(), 'uploads', 'products')
};

// Create directories if they don't exist
await Promise.all(
    Object.values(uploadConfig).map(async (dir) => {
        try {
            await fs.access(dir).catch(async () => {
                await fs.mkdir(dir, { recursive: true });
            });
        } catch (error) {
            console.error(`Error creating directory ${dir}:`, error);
        }
    })
);

// Helper function to check if file exists and delete it
const deleteFileIfExists = async (filePath) => {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
    } catch (error) {
        // File doesn't exist or other error - log but don't throw
        console.error(`File deletion warning: ${error.message}`);
    }
};
// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const { name, description, category, brand, price, stock } = req.body;

        // Handle multiple images
        const images = req.files ? req.files.map((file, index) => ({
            path: `/uploads/products/${file.filename}`,
            isUrl: false,
            isMain: index === 0 // First image is main
        })) : [];

        const product = await Product.create({
            name,
            description,
            category,
            brand,
            price,
            stock,
            images,
            createdBy: req.user._id
        });

        res.status(201).json(product);
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const count = await Product.countDocuments();
        const products = await Product.find({})
            .populate('category', 'name')
            .populate('brand', 'name')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('brand', 'name')
            .populate('createdBy', 'firstName lastName');

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.json(product);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Update basic fields
        Object.keys(req.body).forEach(key => {
            if (key !== 'images') {
                product[key] = req.body[key];
            }
        });

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file, index) => ({
                path: `/uploads/products/${file.filename}`,
                isUrl: false,
                isMain: product.images.length === 0 && index === 0
            }));
            product.images.push(...newImages);
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        await product.deleteOne();
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res, next) => {
    try {
        const { q = '', category, brand, minPrice, maxPrice } = req.query;

        // Build search query
        const searchQuery = {};

        // Text search
        if (q) {
            searchQuery.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            searchQuery.category = category;
        }

        // Brand filter
        if (brand) {
            searchQuery.brand = brand;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            searchQuery.price = {};
            if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
            if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
        }

        // Find products with pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find(searchQuery)
            .populate('category', 'name')
            .populate('brand', 'name')
            .select('name price images description stock')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Product.countDocuments(searchQuery);

        res.json({
            products,
            page,
            pages: Math.ceil(total / limit),
            total
        });

    } catch (error) {
        next(new AppError('Error searching products: ' + error.message, 500));
    }
};
// @desc    Update product main image
// @route   PUT /api/products/:id/main-image
// @access  Private/Admin
export const updateMainImage = async (req, res) => {
    try {
        const { imageId } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        product.images = product.images.map(img => ({
            ...img,
            isMain: img._id.toString() === imageId
        }));

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};
// @desc    Get latest products
// @route   GET /api/products/latest
// @access  Public
export const getLatestProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).limit(5);
        res.json(products);
    } catch (error) {
        console.error('Error fetching latest products:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get most selling products
// @route   GET /api/products/most-selling
// @access  Public

export const getMostSellingProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ sold: -1 }).limit(5);
        res.json(products);
    } catch (error) {
        console.error('Error fetching most selling products:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Check if user already reviewed
        // const alreadyReviewed = product.reviews.find(
        //     r => r.user.toString() === req.user._id.toString()
        // );

        // if (alreadyReviewed) {
        //     throw new AppError('You have already reviewed this product', 400);
        // }

        // Handle review media
        const images = [];
        const videos = [];

        if (req.files) {
            if (req.files.images) {
                images.push(...req.files.images.map(file => ({
                    path: `/uploads/reviews/${file.filename}`
                })));
            }
            if (req.files.videos) {
                videos.push(...req.files.videos.map(file => ({
                    path: `/uploads/reviews/${file.filename}`
                })));
            }
        }

        const review = {
            user: req.user._id,
            rating: Number(rating),
            comment,
            images,
            videos
        };

        product.reviews.push(review);
        product.calculateAverageRating();
        
        await product.save();

        // Populate user details in the new review
        const populatedProduct = await Product.findById(product._id)
            .populate({
                path: 'reviews.user',
                select: 'firstName lastName profilePicture'
            });

        const newReview = populatedProduct.reviews[populatedProduct.reviews.length - 1];

        res.status(201).json({
            message: 'Review added successfully',
            review: newReview
        });
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'reviews.user',
                select: 'firstName lastName profilePicture'
            });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.json({
            reviews: product.reviews,
            rating: product.rating,
            numReviews: product.numReviews
        });
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Delete review
// @route   DELETE /api/products/:productId/reviews/:reviewId
// @access  Private
export const deleteProductReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const review = product.reviews.id(reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        // Check review ownership
        if (review.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to delete this review', 403);
        }

        // Delete associated media files
        if (review.images?.length > 0) {
            await Promise.all(review.images.map(image => {
                const filePath = path.join(process.cwd(), 'uploads', 'reviews', path.basename(image.path));
                return deleteFileIfExists(filePath);
            }));
        }

        if (review.videos?.length > 0) {
            await Promise.all(review.videos.map(video => {
                const filePath = path.join(process.cwd(), 'uploads', 'reviews', path.basename(video.path));
                return deleteFileIfExists(filePath);
            }));
        }

        // Remove review and update product
        product.reviews = product.reviews.filter(r => r._id.toString() !== reviewId);
        product.calculateAverageRating();
        await product.save();

        res.status(200).json({
            status: 'success',
            message: 'Review deleted successfully'
        });
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};
// @desc    Update review
// @route   PUT /api/products/:productId/reviews/:reviewId
// @access  Private
export const updateProductReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;
        const { rating, comment } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Find review
        const review = product.reviews.id(reviewId);
        
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        // Check review ownership
        if (review.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to update this review', 403);
        }

        // Update review fields
        if (rating) review.rating = Number(rating);
        if (comment) review.comment = comment;

        // Handle new images
        if (req.files?.images) {
            // Delete old images
            for (const image of review.images || []) {
                const filePath = path.join(process.cwd(), 'public', image.path);
                await fs.unlink(filePath).catch(err => console.error('File deletion error:', err));
            }

            // Add new images
            review.images = req.files.images.map(file => ({
                path: `/uploads/reviews/${file.filename}`
            }));
        }

        // Handle new videos
        if (req.files?.videos) {
            // Delete old videos
            for (const video of review.videos || []) {
                const filePath = path.join(process.cwd(), 'public', video.path);
                await fs.unlink(filePath).catch(err => console.error('File deletion error:', err));
            }

            // Add new videos
            review.videos = req.files.videos.map(file => ({
                path: `/uploads/reviews/${file.filename}`
            }));
        }

        // Update product rating
        product.calculateAverageRating();
        await product.save();

        // Get updated review with populated user
        const updatedProduct = await Product.findById(productId)
            .populate({
                path: 'reviews.user',
                select: 'firstName lastName avatar'
            });
        const updatedReview = updatedProduct.reviews.id(reviewId);

        res.json({
            message: 'Review updated successfully',
            review: updatedReview
        });
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Add media to review
// @route   POST /api/products/:productId/reviews/:reviewId/media
// @access  Private
export const addReviewMedia = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const review = product.reviews.id(reviewId);
        
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        // Check review ownership
        if (review.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to update this review', 403);
        }

        // Add new media
        if (req.files?.images) {
            if (!review.images) review.images = [];
            review.images.push(...req.files.images.map(file => ({
                path: `/uploads/reviews/${file.filename}`
            })));
        }

        if (req.files?.videos) {
            if (!review.videos) review.videos = [];
            review.videos.push(...req.files.videos.map(file => ({
                path: `/uploads/reviews/${file.filename}`
            })));
        }

        await product.save();

        // Get updated review with populated user
        const updatedProduct = await Product.findById(productId)
            .populate({
                path: 'reviews.user',
                select: 'firstName lastName avatar'
            });
        const updatedReview = updatedProduct.reviews.id(reviewId);

        res.json({
            message: 'Media added to review successfully',
            review: updatedReview
        });
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Delete review media
// @route   DELETE /api/products/:productId/reviews/:reviewId/media/:mediaId
// @access  Private
export const deleteReviewMedia = async (req, res) => {
    try {
        const { productId, reviewId, mediaId } = req.params;
        const { mediaType } = req.query; // 'image' or 'video'
        
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const review = product.reviews.id(reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        // Check review ownership
        if (review.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to update this review', 403);
        }

        // Find and delete media
        const mediaArray = mediaType === 'image' ? review.images : review.videos;
        const mediaIndex = mediaArray.findIndex(m => m._id.toString() === mediaId);
        
        if (mediaIndex === -1) {
            throw new AppError('Media not found', 404);
        }

        // Delete file
        const filePath = path.join(process.cwd(), 'public', mediaArray[mediaIndex].path);
        await fs.unlink(filePath).catch(err => console.error('File deletion error:', err));

        // Remove from array
        mediaArray.splice(mediaIndex, 1);
        await product.save();

        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};