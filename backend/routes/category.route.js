import express from 'express';
import { 
    createCategory, 
    getCategories, 
    getCategoryById, 
    updateCategory, 
    deleteCategory,
    searchCategories 
} from '../controllers/category/category.controllers.js';
import { protect } from '../config/auth/auth.js';
import { admin } from '../config/auth/auth.js';
import multer from 'multer';
import path from 'path';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

// Configure multer for category image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/categories/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 2 }, // 2MB limit
    fileFilter: fileFilter
});

// Public routes
router.get('/', getCategories);
router.get('/search', searchCategories);
router.get('/:id', getCategoryById);

// Protected admin routes
router.use(protect, admin);
router.post('/', upload.single('image'), createCategory);
router.put('/:id', upload.single('image'), updateCategory);
router.delete('/:id', deleteCategory);

export default router;