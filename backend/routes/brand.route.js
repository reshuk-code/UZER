import express from 'express';
import { 
    createBrand, 
    getBrands, 
    getBrandById, 
    updateBrand, 
    deleteBrand,
    searchBrands 
} from '../controllers/brand/brand.controllers.js';
import { protect } from '../config/auth/auth.js';
import { admin } from '../config/auth/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for brand logo uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/brands/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'brand-' + uniqueSuffix + path.extname(file.originalname));
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
router.get('/', getBrands);
router.get('/search', searchBrands);
router.get('/:id', getBrandById);

// Protected admin routes
router.use(protect, admin);
router.post('/', upload.single('logo'), createBrand);
router.put('/:id', upload.single('logo'), updateBrand);
router.delete('/:id', deleteBrand);

export default router;