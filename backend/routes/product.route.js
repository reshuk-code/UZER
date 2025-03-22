import express from 'express';
import { 
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    updateMainImage,
    createProductReview,
    getProductReviews,
    deleteProductReview,
    updateProductReview,
    addReviewMedia,
    deleteReviewMedia,
    getLatestProducts,
    getMostSellingProducts,
} from '../controllers/product/product.controllers.js';
import { protect } from '../config/auth/auth.js';
import { admin } from '../config/auth/auth.js';
import multer from 'multer';
import path from 'path';
import AppError from '../utils/AppError.js';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Set up directory for uploads
const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../uploads');
const reviewsDir = path.join(uploadDir, 'reviews');
const productsDir = path.join(uploadDir, 'products');

// Create upload directories if they don't exist
[reviewsDir, productsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure multer for product images
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, productsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const productUpload = multer({
    storage: productStorage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 files
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new AppError('Not an image! Please upload only images.', 400), false);
        }
    }
});

// Configure multer for review media
const reviewStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, reviewsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const reviewUpload = multer({
    storage: reviewStorage,
    limits: {
        files: 7, // Total files (5 images + 2 videos)
        fileSize: 50 * 1024 * 1024 // 50MB limit for videos
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'images' && !file.mimetype.startsWith('image/')) {
            return cb(new AppError('Only image files are allowed!', 400), false);
        }
        if (file.fieldname === 'videos' && !file.mimetype.startsWith('video/')) {
            return cb(new AppError('Only video files are allowed!', 400), false);
        }
        cb(null, true);
    }
}).fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 }
]);

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);
router.get('/latest', getLatestProducts);
router.get('/most-selling', getMostSellingProducts);

// Protected user routes (reviews)
router.post('/:id/reviews', protect, reviewUpload, createProductReview);
router.put('/:productId/reviews/:reviewId', protect, reviewUpload, updateProductReview);
router.delete('/:productId/reviews/:reviewId', protect, deleteProductReview);
router.post('/:productId/reviews/:reviewId/media', protect, reviewUpload, addReviewMedia);
router.delete('/:productId/reviews/:reviewId/media/:mediaId', protect, deleteReviewMedia);

// Protected admin routes
router.use(protect, admin);
router.post('/', productUpload.array('images', 5), createProduct);
router.put('/:id', productUpload.array('images', 5), updateProduct);
router.delete('/:id', deleteProduct);
router.put('/:id/main-image', updateMainImage);

export default router;